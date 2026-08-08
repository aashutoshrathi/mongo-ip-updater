const currentIpUrl = "https://hutils.loxal.net/whois";

const getCurrentIp = async () => {
  const response = await fetch(currentIpUrl);
  if (!response.ok) throw new Error("Could not determine your current IP address.");

  const data = await response.json();
  if (!data.ip) throw new Error("The IP service returned an invalid response.");
  return data.ip;
};

const setStatus = (message, isError = false) => {
  const status = document.querySelector("#status");
  status.textContent = message;
  status.classList.toggle("error", isError);
};

const setBusy = (busy) => {
  const button = document.querySelector("#upsert");
  button.disabled = busy;
  button.textContent = busy ? "Updating…" : "Add or update access list";
};

const getActiveMongoTab = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (!tab?.url) throw new Error("Could not read the active tab.");

  const hostname = new URL(tab.url).hostname;
  if (hostname !== "mongodb.com" && !hostname.endsWith(".mongodb.com")) {
    throw new Error("Open MongoDB Atlas in the active tab and try again.");
  }
  return tab;
};

document.addEventListener("DOMContentLoaded", async () => {
  const nameInput = document.querySelector('input[name="name"]');
  const ipInput = document.querySelector('input[name="ip"]');
  const version = chrome.runtime.getManifest().version;
  document.querySelector("#version").textContent = `v${version}`;

  const stored = await chrome.storage.sync.get("name");
  if (stored.name) nameInput.value = stored.name;

  nameInput.addEventListener("input", () => {
    chrome.storage.sync.set({ name: nameInput.value.trim() });
  });

  try {
    ipInput.value = await getCurrentIp();
  } catch (error) {
    setStatus(error.message, true);
  }

  document.querySelector("#upsert").addEventListener("click", async () => {
    setStatus("");
    setBusy(true);

    try {
      const name = nameInput.value.trim();
      const ip = ipInput.value.trim();
      if (!name) throw new Error("Enter a name for the access-list entry.");
      if (!ip) throw new Error("Enter an IP address or CIDR range.");

      const tab = await getActiveMongoTab();
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "UPSERT_IP_ENTRY",
        values: { name, ip },
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Atlas did not complete the update.");
      }
      setStatus(`Access-list entry ${response.operation}.`);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      setBusy(false);
    }
  });
});
