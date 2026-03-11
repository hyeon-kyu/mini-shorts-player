const SHORTS_HOME_URL = "https://m.youtube.com/shorts";
const SHORTS_WINDOW_ID_KEY = "shortsWindowId";

const WINDOW_SIZE = {
  width: 430,
  height: 820
};

async function getStoredWindowId() {
  const data = await chrome.storage.local.get([SHORTS_WINDOW_ID_KEY]);
  return data[SHORTS_WINDOW_ID_KEY];
}

async function setStoredWindowId(windowId) {
  await chrome.storage.local.set({ [SHORTS_WINDOW_ID_KEY]: windowId });
}

async function clearStoredWindowId() {
  await chrome.storage.local.remove([SHORTS_WINDOW_ID_KEY]);
}

async function createShortsWindow() {
  const created = await chrome.windows.create({
    url: SHORTS_HOME_URL,
    type: "popup",
    width: WINDOW_SIZE.width,
    height: WINDOW_SIZE.height,
    focused: true
  });

  if (created?.id !== undefined) {
    await setStoredWindowId(created.id);
  }
}

async function openOrFocusShortsWindow() {
  const storedWindowId = await getStoredWindowId();

  if (storedWindowId !== undefined) {
    try {
      await chrome.windows.update(storedWindowId, { focused: true });
      return;
    } catch {
      await clearStoredWindowId();
    }
  }

  await createShortsWindow();
}

chrome.action.onClicked.addListener(() => {
  openOrFocusShortsWindow();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-shorts-window") {
    openOrFocusShortsWindow();
  }
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  const storedWindowId = await getStoredWindowId();
  if (storedWindowId === windowId) {
    await clearStoredWindowId();
  }
});
