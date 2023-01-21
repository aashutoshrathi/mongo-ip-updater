const getCurrentIp = async () => {
  const apiData = await fetch("https://www.cloudflare.com/cdn-cgi/trace");
  const textData = await apiData.text();
  const data = textData
    .trim()
    .split("\n")
    .reduce(function (obj, pair) {
      pair = pair.split("=");
      return (obj[pair[0]] = pair[1]), obj;
    }, {});

  return data.ip;
};

const updateIpField = async () => {
  const ip = await getCurrentIp();
  document.querySelector("#ip").value = ip;
};

document
  .querySelector('input[name="name"]')
  .addEventListener("keydown", function () {
    const name = document.querySelector('input[name="name"]').value;
    chrome.storage.sync.set({ name: name });
  });

document.querySelector("#upsert").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    if (tab.url.indexOf("mongodb.com") === -1) {
      return;
    }

    const name = document.querySelector('input[name="name"]').value;
    const ip = document.querySelector("input[name='ip']").value;
    await chrome.tabs.sendMessage(tab.id, {
      action: "upsert",
      values: {
        name,
        ip,
        isCurrentIp: ip === await getCurrentIp(),
      },
    });
    window.close();
  } catch (e) {
    document.querySelector("#error").innerText = e.message;
  }
});

document.querySelector("#refresh-ip").addEventListener("click", async () => {
  updateIpField();
});

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get("name", function (data) {
    if (data.name) {
      document.querySelector('input[name="name"]').value = data.name;
    }
  });

  updateIpField();
});
