declare namespace chrome.contextMenus {
  export const ContextType: {
    [P in chrome.contextMenus.ContextType as Uppercase<P>]: P;
  };

  export const ItemType: {
    [P in chrome.contextMenus.ContextItemType as Uppercase<P>]: P;
  };

  export const removeAll: {
    (callback: () => void): void;
    (): Promise<void>;
  };
}
