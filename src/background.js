const MANIFEST = chrome.runtime.getManifest();
const onInstalled = async () => {
    const sites = MANIFEST.content_scripts.map((t) => t.matches).flat();
    const tabs = await chrome.tabs.query({ url: sites });
    chrome.storage.sync.set({ version: `v${MANIFEST.version}` });
    await Promise.all(Array.from(tabs, (tab) => chrome.tabs.reload(tab.id)));
};

// reload pages on install
chrome.runtime.onInstalled.addListener(onInstalled);
