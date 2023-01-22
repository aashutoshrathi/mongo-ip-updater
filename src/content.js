const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fillIP = async (ip) => {
  if (!ip) {
    const addCurrentButton = document.querySelector(
      "button[name='addCurrentIpAddress']"
    );

    if (addCurrentButton) {
      addCurrentButton.click();
      await sleep(1000);
    }
    return;
  }
  const ipField = document.querySelector('[name="networkPermissionEntry"]');
  
  if (ipField) {
    ipField.value = ip;
  }
};

const clickSaveButton = async () => {
  const submitButton = document.querySelector(
    "button.button-is-primary[name='confirm']"
  );
  if (!submitButton) return;
  submitButton.click();
};

const addNewEntry = async (name, ip) => {
  const allSectionControls = document.querySelector(
    ".section-controls-is-end-justified"
  ).children;
  for (const e of allSectionControls) {
    if (e.innerText === " ADD IP ADDRESS") {
      e.click();
      break;
    }
  }
  await sleep(1000);
  await fillIP(ip);

  // Add Comment as entry name
  document.querySelector('[name="comment"]').value = name;

  // save
  await clickSaveButton();
};

const updateIpAddress = async (ip) => {
  await sleep(2000);
  await fillIP(ip);
  await clickSaveButton();
};

const runIt = async (values) => {
  const { name, ip, isCurrentIp } = values;
  // Go to NAL Page
  if (window.location.hash !== "#/security/network/accessList") {
    window.location.hash = "#/security/network/accessList";
    await sleep(1000);
  }

  // find existing entry
  const namedEntries = document.querySelectorAll(".plain-table-cell");
  let found = false;
  for (const e of namedEntries) {
    if (e.innerText === name) {
      const targetElement = e.nextElementSibling.nextElementSibling;
      targetElement.querySelector(".js-edit-entry").click();
      found = true;
      break;
    }
  }

  console.info("IP entry found =>", found);
  if (!found) {
    await addNewEntry(name, isCurrentIp ? undefined : ip);
  } else {
    await updateIpAddress(isCurrentIp ? undefined : ip);
  }
};

window.onload = () => {
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.action === "upsert") {
        await runIt(request.values);
      }
      return;
    }
  );
};
