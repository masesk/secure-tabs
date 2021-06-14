var tab_actions = {};
var allowed_tab = -1;
var new_tabs = {};
var enabled = true;

const getStatus = (callback) => {
  chrome.storage.local.get("secure-tabs-status", (data) => {
    if (data["secure-tabs-status"] === undefined) {
      callback(true);
    } else {
      callback(data["secure-tabs-status"]);
    }
  });
};

const remove_tab_on_create = (tab) => {
  if (tab_actions[tab.openerTabId] === undefined) {
    tab_actions[tab.openerTabId] = [];
  }
  tab_actions[tab.openerTabId].push(tab);
  chrome.tabs.remove(tab.id, function () {});
  chrome.browserAction.setBadgeText({
    text: tab_actions[tab.openerTabId].length.toString(),
  });
  chrome.runtime.sendMessage(
    { type: "update-ui", data: tab_actions[tab.openerTabId] },
    function () {}
  );
};

chrome.tabs.onCreated.addListener(function (tab) {
  if (enabled) {
    if (tab.index === allowed_tab) {
      allowed_tab = -1;
      return;
    } else if (tab.pendingUrl && !tab.pendingUrl.startsWith("chrome://")) {
      remove_tab_on_create(tab);
    } else if (!tab.pendingUrl || !tab.pendingUrl.startsWith("chrome://")) {
      new_tabs[tab.id] = true;
    }
  }
});

chrome.tabs.onActivated.addListener(function (tab) {
  if (tab_actions[tab.tabId] === undefined) {
    chrome.browserAction.setBadgeText({ text: "" });
  } else {
    chrome.browserAction.setBadgeText({
      text: tab_actions[tab.tabId].length.toString(),
    });
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  delete tab_actions[tabId];
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (new_tabs[tabId]) {
    remove_tab_on_create(tab);
    delete new_tabs[tabId];
  }
  if (changeInfo.status === "loading") {
    delete tab_actions[tabId];
    chrome.browserAction.setBadgeText({ text: "" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "tab-data":
      sendResponse({ data: tab_actions[message.tabId] });
      break;
    case "allow-tab":
      const saved_tab = tab_actions[message.tabId][message.index];
      chrome.tabs.query({}, function (foundTabs) {
        allowed_tab = foundTabs.length - 1;
        chrome.tabs.create(
          {
            active: saved_tab.active,
            url: saved_tab.pendingUrl || saved_tab.url,
            windowId: saved_tab.windowId,
            index: foundTabs.length,
          },
          function (tab) {
            console.log(tab);
          }
        );
        chrome.browserAction.setBadgeText({
          text: tab_actions[message.tabId].length.toString(),
        });
      });
      tab_actions[message.tabId].splice(message.index, 1);
      sendResponse({ data: tab_actions[message.tabId] });
      break;
    case "ignore-tab":
      tab_actions[message.tabId].splice(message.index, 1);
      chrome.browserAction.setBadgeText({
        text: tab_actions[message.tabId].length.toString(),
      });
      sendResponse({ data: tab_actions[message.tabId] });
      break;
    case "status":
      if (message.status) {
        enabled = true;
        chrome.browserAction.setIcon(
          { path: { 48: "img/logo-48.png" } },
          function () {}
        );
      } else {
        enabled = false;
        Object.keys(new_tabs).forEach((k) => delete new_tabs[k]);
        Object.keys(tab_actions).forEach((k) => delete tab_actions[k]);
        chrome.browserAction.setBadgeText({
          text: "",
        });
        chrome.browserAction.setIcon(
          { path: { 48: "img/logo-off.png" } },
          function () {}
        );
      }
      break;
    default:
      break;
  }
});

getStatus(function (toggle) {
  enabled = toggle;
  if (enabled) {
    chrome.browserAction.setIcon(
      { path: { 48: "img/logo-48.png" } },
      function () {}
    );
  } else {
    chrome.browserAction.setIcon(
      { path: { 48: "img/logo-off.png" } },
      function () {}
    );
  }
});
