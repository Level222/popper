const BUTTON_ACTIONS = /** @type {const} */([
  'OPEN_CURRENT_URL_IN_POPUP',
  'MOVE_CURRENT_TAB_TO_POPUP',
]);

/**
 * @typedef {typeof BUTTON_ACTIONS[number]} ButtonAction
 */

/**
 * @template T
 * @template {T} U
 * @param {readonly U[]} array
 * @param {T} searchElement
 * @returns {searchElement is U} whether array includes searchElement
 */
const includes = (array, searchElement) => {
  return array.includes(/** @type {any} */(searchElement));
};

/**
 * @param {string} value
 * @returns {value is ButtonAction} whether value is SyncOptions
 */
const isButtonAction = (value) => {
  return includes(BUTTON_ACTIONS, value);
};

/**
 * @type {ButtonAction}
 */
const DEFAULT_BUTTON_ACTION = 'OPEN_CURRENT_URL_IN_POPUP';

const BUTTON_ACTION_STORAGE_KEY = 'buttonAction';

/**
 * @template T
 * @template {keyof T} U
 * @typedef {T & { [P in U]-?: T[P] }} WithRequired
 */

/**
 * @param {Omit<WithRequired<chrome.windows.CreateData, 'incognito'>, 'type'>} popupCreateData
 */
const openPopup = (popupCreateData) => {
  chrome.windows.create({
    ...popupCreateData,
    type: 'popup',
  });
};

// Ids for context menu items
const OPEN_LINK_IN_POPUP_MENU_ID = 'OPEN_LINK_IN_POPUP';
const OPEN_FRAME_IN_POPUP_MENU_ID = 'OPEN_FRAME_IN_POPUP';
const CONVERT_TO_STANDARD_WINDOW_MENU_ID = 'CONVERT_TO_STANDARD_WINDOW';
const OPEN_CURRENT_URL_IN_POPUP_MENU_ID = 'OPEN_CURRENT_URL_IN_POPUP';
const MOVE_CURRENT_TAB_TO_POPUP_MENU_ID = 'MOVE_CURRENT_TAB_TO_POPUP';
const ACTION_BUTTON_MENU_ID = 'ACTION_BUTTON';
const OPEN_CURRENT_URL_IN_POPUP_ACTION_MENU_ID = 'OPEN_CURRENT_URL_IN_POPUP_ACTION';
const MOVE_CURRENT_TAB_TO_POPUP_ACTION_MENU_ID = 'MOVE_CURRENT_TAB_TO_POPUP_ACTION';

// Register context menu items
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: OPEN_LINK_IN_POPUP_MENU_ID,
    title: 'Open Link in Pop-up',
    contexts: [chrome.contextMenus.ContextType.LINK],
  });

  chrome.contextMenus.create({
    id: OPEN_FRAME_IN_POPUP_MENU_ID,
    title: 'Open Frame in Pop-up',
    contexts: [chrome.contextMenus.ContextType.FRAME],
  });

  chrome.contextMenus.create({
    id: CONVERT_TO_STANDARD_WINDOW_MENU_ID,
    title: 'Convert to Standard Window',
    visible: false,
    contexts: [chrome.contextMenus.ContextType.PAGE],
  });

  chrome.contextMenus.create({
    id: OPEN_CURRENT_URL_IN_POPUP_MENU_ID,
    title: 'Open Current URL in Pop-up',
    contexts: [chrome.contextMenus.ContextType.ACTION],
  });

  chrome.contextMenus.create({
    id: MOVE_CURRENT_TAB_TO_POPUP_MENU_ID,
    title: 'Move Current Tab to Pop-up',
    contexts: [chrome.contextMenus.ContextType.ACTION],
  });

  chrome.contextMenus.create({
    id: ACTION_BUTTON_MENU_ID,
    title: 'Action Button',
    contexts: [chrome.contextMenus.ContextType.ACTION],
  });

  chrome.contextMenus.create({
    id: OPEN_CURRENT_URL_IN_POPUP_ACTION_MENU_ID,
    title: 'Open Current URL In Pop-up',
    contexts: [chrome.contextMenus.ContextType.ACTION],
    parentId: ACTION_BUTTON_MENU_ID,
    type: chrome.contextMenus.ItemType.RADIO,
  });

  chrome.contextMenus.create({
    id: MOVE_CURRENT_TAB_TO_POPUP_ACTION_MENU_ID,
    title: 'Move Current Tab to Pop-up',
    contexts: [chrome.contextMenus.ContextType.ACTION],
    parentId: ACTION_BUTTON_MENU_ID,
    type: chrome.contextMenus.ItemType.RADIO,
  });
});

// Get options from sync storage
const gettingInitialButtonAction = chrome.storage.sync.get(BUTTON_ACTION_STORAGE_KEY)
  .then((storage) => (
    isButtonAction(storage[BUTTON_ACTION_STORAGE_KEY])
      ? storage[BUTTON_ACTION_STORAGE_KEY]
      : DEFAULT_BUTTON_ACTION
  ));

/**
 * @type {ButtonAction | undefined}
 */
let buttonAction;

// Handle clicks on context menu items
chrome.contextMenus.onClicked.addListener(({ menuItemId, linkUrl, frameUrl }, tab) => {
  if (menuItemId === OPEN_LINK_IN_POPUP_MENU_ID && linkUrl && tab) {
    openPopup({
      incognito: tab.incognito,
      url: linkUrl,
    });
  }

  if (menuItemId === OPEN_FRAME_IN_POPUP_MENU_ID && frameUrl && tab) {
    openPopup({
      incognito: tab.incognito,
      url: frameUrl,
    });
  }

  if (menuItemId === CONVERT_TO_STANDARD_WINDOW_MENU_ID && tab?.id) {
    chrome.windows.create({
      incognito: tab.incognito,
      tabId: tab.id,
    });
  }

  if (menuItemId === OPEN_CURRENT_URL_IN_POPUP_MENU_ID && tab?.url) {
    openPopup({
      incognito: tab.incognito,
      url: tab.url,
    });
  }

  if (menuItemId === MOVE_CURRENT_TAB_TO_POPUP_MENU_ID && tab?.id) {
    openPopup({
      incognito: tab.incognito,
      tabId: tab.id,
    });
  }

  if (menuItemId === OPEN_CURRENT_URL_IN_POPUP_ACTION_MENU_ID) {
    buttonAction = 'OPEN_CURRENT_URL_IN_POPUP';
    chrome.storage.sync.set({ [BUTTON_ACTION_STORAGE_KEY]: buttonAction });
  }

  if (menuItemId === MOVE_CURRENT_TAB_TO_POPUP_ACTION_MENU_ID) {
    buttonAction = 'MOVE_CURRENT_TAB_TO_POPUP';
    chrome.storage.sync.set({ [BUTTON_ACTION_STORAGE_KEY]: buttonAction });
  }
});

// Update the visibility of the "To Standard Window" menu when the active tab is changed
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const window = await chrome.windows.get(windowId);

  chrome.contextMenus.update(CONVERT_TO_STANDARD_WINDOW_MENU_ID, {
    visible: window.type === 'popup',
  });
});

// Handle clicks on the action button
chrome.action.onClicked.addListener(async (tab) => {
  if (buttonAction === undefined) {
    buttonAction = await gettingInitialButtonAction;
  }

  switch (buttonAction) {
    case 'OPEN_CURRENT_URL_IN_POPUP': {
      if (tab.url) {
        openPopup({
          incognito: tab.incognito,
          url: tab.url,
        });
      }

      break;
    }

    case 'MOVE_CURRENT_TAB_TO_POPUP': {
      if (tab.id) {
        openPopup({
          incognito: tab.incognito,
          tabId: tab.id,
        });
      }

      break;
    }
  }
});
