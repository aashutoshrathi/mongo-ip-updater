chrome.storage.sync.get("name", function (data) {
  if (data.name) {
    document.querySelector('input[name="name"]').value = data.name;
  }
});

document.querySelector("#save").addEventListener("click", function () {
  var name = document.querySelector('input[name="name"]').value;
  chrome.storage.sync.set({ name: name });
});

document.querySelector("#upsert").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  await chrome.tabs.sendMessage(tab.id, {
    action: "upsert",
    value: document.querySelector('input[name="name"]').value,
  });
});