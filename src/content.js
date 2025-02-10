const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const NAL_URL = "#/security/network/accessList";

const fillIP = async (ip) => {
  if (!ip) {
    const buttons = document.querySelectorAll(
      '[data-testid="lg-modal"] button'
    );

    const addCurrentButton = Array.from(buttons).find(
      (b) => b.innerText === "ADD CURRENT IP ADDRESS"
    );

    if (addCurrentButton) {
      addCurrentButton.click();
      await sleep(1000);
    }
    return;
  }

  const ipField = document.querySelector(
    '[aria-labelledby="accessListEntryLabel"]'
  );

  if (ipField) {
    ipField.value = ip;
  }
};

const clickSaveButton = async () => {
  const submitButton = document.querySelector(
    '[data-testid="lg-confirmation_modal-footer-confirm_button"]'
  );
  if (!submitButton) return;
  submitButton.click();
};

const addNewEntry = async (name, ip) => {
  const button = document.querySelector(`[href="${NAL_URL}/addToAccessList"]`);
  if (button.innerText === "ADD IP ADDRESS") {
    button.click();
  }
  await sleep(500);
  await fillIP(ip);
  await sleep(500);

  // Add Comment as entry name
  const commentBox = document.querySelector(
    'input[aria-labelledby="commentLabel"]'
  );
  commentBox.focus();
  // TODO: Fix this auto-clear issue
  commentBox.value = name;
  await sleep(500);

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
  if (window.location.hash !== NAL_URL) {
    window.location.hash = NAL_URL;
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
      if (request.action === "UPSERT_IP_ENTRY") {
        await runIt(request.values);
      }
      return;
    }
  );
};
