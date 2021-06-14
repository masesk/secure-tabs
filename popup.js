var activeTabId;
const removeAllChildren = (mainList) => {
  while (mainList.firstChild) {
    mainList.removeChild(mainList.lastChild);
  }
};

const getStatus = (callback) => {
  chrome.storage.local.get("secure-tabs-status", (data) => {
    if (data["secure-tabs-status"] === undefined) {
      callback(true);
    } else {
      callback(data["secure-tabs-status"]);
    }
  });
};

const setStatus = (value, callback) => {
  // expects function(){...}
  chrome.storage.local.set({ "secure-tabs-status": value }, function () {
    if (chrome.runtime.lastError) {
      throw Error(chrome.runtime.lastError);
    } else {
      callback();
    }
  });
};

const parseData = (message, mainList) => {
  var i;
  if (message.data === undefined || message.data.length == 0) {
    const noData = document.createElement("span");
    noData.textContent = "No requests for new tabs available from this tab";
    mainList.appendChild(noData);
    return
  }
  for (i = 0; i < message.data.length; i++) {
    const li = document.createElement("li");
    const title = document.createElement("div");
    const div = document.createElement("div");
    const allowButton = document.createElement("button");
    const ignoreButton = document.createElement("button");
    allowButton.className = "btn btn-success";
    ignoreButton.className = "btn btn-secondary";
    title.className = "fw-bold";
    div.className = "ms-2 me-auto";
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    allowButton.setAttribute("rowIndex", i);
    allowButton.className = "check";
    ignoreButton.setAttribute("rowIndex", i);
    ignoreButton.className = "close";
    li.appendChild(title);
    li.append(div);
    li.appendChild(allowButton);
    li.appendChild(ignoreButton);
    title.textContent = i + 1;
    div.textContent = message.data[i].pendingUrl || message.data[i].url;
    div.style.whiteSpace = "nowrap";
    div.style.overflow = "hidden";
    div.style.textOverflow = "ellipsis";
    div.style.fontSize = "12px";
    div.setAttribute(
      "title",
      message.data[i].pendingUrl || message.data[i].url
    );
    mainList.appendChild(li);

    allowButton.addEventListener("click", (btn) => {
      chrome.runtime.sendMessage(
        {
          type: "allow-tab",
          tabId: activeTabId,
          index: btn.currentTarget.getAttribute("rowIndex"),
        },
        function (response) {
          removeAllChildren(mainList);
          parseData(response, mainList);
        }
      );
    });
    ignoreButton.addEventListener("click", (btn) => {
      chrome.runtime.sendMessage(
        {
          type: "ignore-tab",
          tabId: activeTabId,
          index: btn.currentTarget.getAttribute("rowIndex"),
        },
        function (response) {
          removeAllChildren(mainList);
          parseData(response, mainList);
        }
      );
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  var enabled;
  const logo = document.getElementById("logo");
  const mainList = document.getElementById("main-list");
  const settingsButton = document.getElementById("nav-settings-tab");
  const requestsButton = document.getElementById("nav-requests-tab");
  const settingsTab = document.getElementById("nav-settings");
  const requestsTab = document.getElementById("nav-requests");

  const statusToggle = document.getElementById("secure-tabs-status-toggle");
  const lockToggle = document.getElementById("secure-tabs-lock-toggle");

  getStatus(function (toggle) {
    enabled = toggle;
    statusToggle.checked = toggle;
    if (toggle) {
      logo.style.animation = "heartbeat 1s infinite"
    } else {
      logo.style.animation = undefined
    }
  });

  statusToggle.addEventListener("change", () => {
    if (statusToggle.checked) {
      enabled = true;
      logo.style.animation = "heartbeat 1s infinite"
    } else {
      enabled = false;
      logo.style.animation = undefined
      removeAllChildren(mainList)
      const noData = document.createElement("span");
      noData.textContent = "No requests for new tabs available from this tab";
      mainList.appendChild(noData);
    }
    setStatus(enabled, () => {});
    chrome.runtime.sendMessage(
      { type: "status", status: enabled }
    );
  });

  settingsButton.addEventListener("click", (btn) => {
    settingsButton.className = "nav-link active";
    requestsButton.className = "nav-link";
    settingsTab.className = "tab-pane fade show active";
    requestsTab.className = "tab-pane fade";
  });
  requestsButton.addEventListener("click", (btn) => {
    requestsButton.className = "nav-link active";
    settingsButton.className = "nav-link";
    requestsTab.className = "tab-pane fade show active";
    settingsTab.className = "tab-pane fade";
  });
  removeAllChildren(mainList);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    activeTabId = tabs[0].id;
    chrome.runtime.sendMessage(
      { type: "tab-data", tabId: tabs[0].id },
      function (response) {
        parseData(response, mainList);
      }
    );
  });

  

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.type){
      case "update-ui":
        removeAllChildren(mainList);
        parseData(message, mainList);
        sendResponse("done")
    }
  });
});
