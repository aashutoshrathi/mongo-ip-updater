const getCurrentIp = async () => {
  try {
    const apiData = await fetch("https://hutils.loxal.net/whois");
    const data = await apiData.json();
    return data.ip;
  } catch (e) {
    console.error(e.message);
    return "";
  }
};

const updateIpField = async () => {
  const ip = await getCurrentIp();
  document.querySelector("#ip").value = ip;
};

document.addEventListener("DOMContentLoaded", function () {
  // get current value from storage & fill it in input field
  chrome.storage.sync.get("name", function (data) {
    if (data.name) {
      document.querySelector('input[name="name"]').value = data.name;
    }
  });

  // Fill in the current IP
  updateIpField();

  document
    .querySelector('input[name="name"]')
    ?.addEventListener("keyup", function () {
      const name = document.querySelector('input[name="name"]').value;
      chrome.storage.sync.set({ name: name });
    });

  document.querySelector("#upsert")?.addEventListener("click", async () => {
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
          isCurrentIp: ip === (await getCurrentIp()),
        },
      });
      window.close();
    } catch (e) {
      document.querySelector("#error").innerText = e.message;
    }
  });
});
