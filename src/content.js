const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const clickOnAddCurrentIP = async () => {
  const addCurrentButton = document.querySelector(
    "button[name='addCurrentIpAddress']"
  );
  if (addCurrentButton) {
    addCurrentButton.click();
    await sleep(1000);
  }
};

const clickOnSaveButton = async () => {
  const submitButton = document.querySelector(
    "button.button-is-primary[name='confirm']"
  );
  if (!submitButton) return;
  submitButton.click();
};

const addNewEntry = async (name) => {
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
  await clickOnAddCurrentIP();

  // Add Comment as entry name
  document.querySelector('[name="comment"]').value = name;

  // save
  await clickOnSaveButton();
};

const updateIpAddress = async () => {
  await sleep(2000);
  await clickOnAddCurrentIP();
  await clickOnSaveButton();
};

const runIt = async (name) => {
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

  console.log("NAL Entry found?", found);
  if (!found) {
    await addNewEntry(name);
  } else {
    await updateIpAddress();
  }
};

window.onload = () => {
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.action === "upsert") {
        await runIt(request.value);
      }
    }
  );
};
