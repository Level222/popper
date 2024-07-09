/**
 * @param {string} url
 * @param {boolean} incognito
 */
const openPopup = (url, incognito) => {
  chrome.windows.create({
    type: 'popup',
    url,
    incognito,
  });
};

// Ids for context menu items
const LINK_MENU_ID = 'OPEN_LINK_IN_POP_UP';
const FRAME_MENU_ID = 'OPEN_FRAME_IN_POP_UP';

// Register context menu items
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: LINK_MENU_ID,
    title: 'Open Link in Pop-up',
    contexts: [chrome.contextMenus.ContextType.LINK],
  });

  chrome.contextMenus.create({
    id: FRAME_MENU_ID,
    title: 'Open Frame in Pop-up',
    contexts: [chrome.contextMenus.ContextType.FRAME],
  });
});

// Handle clicks on context menu items
chrome.contextMenus.onClicked.addListener(({ menuItemId, linkUrl, frameUrl }, tab) => {
  if (menuItemId === LINK_MENU_ID && linkUrl && tab) {
    openPopup(linkUrl, tab.incognito);
  }

  if (menuItemId === FRAME_MENU_ID && frameUrl && tab) {
    openPopup(frameUrl, tab.incognito);
  }
});

// Handle clicks on the action icon
chrome.action.onClicked.addListener((tab) => {
  if (tab.url) {
    openPopup(tab.url, tab.incognito);
  }
});
