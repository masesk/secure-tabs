# secure-tabs
![logo.png](img/logo-128.png)

Chrome extension that restricts pages from spawning new windows / tabs as well as giving the option to restrict redirecting of the current site.

### Requirements

* Google Chrome

### Installation

#### Option 1 (Linux Only)
1. Download CRX file from [latest release](https://github.com/masesk/secure-tabs/releases).
2. Type ```chrome://extensions/``` in the *Chrome* browser top bar.
3. Toggle ```Developer Mode``` switch on from the top right corner.
4. Drag and drop the crx file to the middle of the window.

#### Option 2 (Windows and Linux)
1. Clone the [secure-tabs](https://github.com/masesk/secure-tabs/) repo.
2. Type ```chrome://extensions/``` in the *Chrome* browser top bar.
3. Toggle ```Developer Mode``` switch on from the top right corner.
4. Click ```Load Unpacked``` and select the cloned repo root directory.

### How to use

1. Secure Tabs comes enabled and ready to block new tabs / windows from opening.
2. It might be a good idea to pin the extension for easy access to the UI. [Checkout a guide on how to do that here](https://www.chromestory.com/2019/05/pinned-extensions/).
3. When a website wants to open a new tab, the tab will be waiting for confirmation from the user to open in the UI.
4. Clicking the green checkmark will spawn the requested tab while clicking the red X will ignore it.
5. If the URL is too long, simply hover over it to see the entire URL.
6. To turn off Secure Tabs, click on the UI, settings, and toggle *Enable Secure Tabs* to off.
7. Each tab contains its own list of tabs awaiting approval in the UI.


### To-Do / Later Features

1. **Lock feature**: prevent page from leaving the current page (no redirects)
2. **Exception/Trusted feature**: add pages to exception list to automatically allow new tabs without confirmation.  
>>>>>>> master
