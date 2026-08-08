const reloadMongoTabs = async () => {
  const manifest = chrome.runtime.getManifest();
  const matches = manifest.content_scripts.flatMap((script) => script.matches);
  const tabs = await chrome.tabs.query({ url: matches });

  await Promise.all(
    tabs
      .filter((tab) => Number.isInteger(tab.id))
      .map((tab) => chrome.tabs.reload(tab.id).catch(() => undefined))
  );
};

// Existing Atlas tabs do not receive a newly installed content script until
// they reload, so refresh only the URLs covered by this extension.
chrome.runtime.onInstalled.addListener(() => {
  reloadMongoTabs().catch((error) => {
    console.error("Mongo IP Updater could not reload Atlas tabs:", error);
  });
});
