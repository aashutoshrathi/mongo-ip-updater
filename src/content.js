const ACCESS_LIST_HASH = "#/security/network/accessList";
const DEFAULT_TIMEOUT_MS = 15000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeText = (value) => value?.replace(/\s+/g, " ").trim() || "";

const queryFirst = (selectors, root = document) => {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element) return element;
  }
  return null;
};

const findControlByText = (patterns, root = document) => {
  const controls = root.querySelectorAll('button, a, [role="button"]');
  return Array.from(controls).find((control) => {
    const text = normalizeText(control.textContent);
    return patterns.some((pattern) => pattern.test(text));
  });
};

const waitFor = async (find, description, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const deadline = Date.now() + timeoutMs;
  let value = find();

  while (!value && Date.now() < deadline) {
    await sleep(150);
    value = find();
  }

  if (!value) {
    throw new Error(`Timed out waiting for ${description}. Atlas may have changed its UI.`);
  }
  return value;
};

// React tracks an input's native setter. Assigning element.value directly can
// update the DOM without updating the value submitted by Atlas.
const setInputValue = (input, value) => {
  const prototype = Object.getPrototypeOf(input);
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (setter) setter.call(input, value);
  else input.value = value;

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const getDialog = () =>
  queryFirst([
    '[role="dialog"]',
    '[data-testid="lg-modal"]',
    '[data-testid*="modal"]',
  ]);

const getIpInput = (root = document) =>
  queryFirst(
    [
      'input[name="networkPermissionEntry"]',
      'input[aria-labelledby="accessListEntryLabel"]',
      'input[aria-label*="IP Address" i]',
      'input[aria-label*="CIDR" i]',
      'input[name*="cidr" i]',
      'input[name*="ip" i]',
    ],
    root
  );

const getCommentInput = (root = document) =>
  queryFirst(
    [
      'input[aria-labelledby="commentLabel"]',
      'input[aria-label*="comment" i]',
      'input[name*="comment" i]',
      'textarea[aria-label*="comment" i]',
      'textarea[name*="comment" i]',
    ],
    root
  );

const findEntryRow = (name) => {
  const expected = normalizeText(name);
  const rows = document.querySelectorAll(
    'tbody tr, [role="row"], [data-testid*="row"]'
  );

  return Array.from(rows).find((row) => {
    const cells = row.querySelectorAll(
      'td, [role="cell"], [role="gridcell"], .plain-table-cell'
    );
    return Array.from(cells).some(
      (cell) => normalizeText(cell.textContent) === expected
    );
  });
};

const getAddButton = () =>
  queryFirst([
    `[href="${ACCESS_LIST_HASH}/addToAccessList"]`,
    '[data-testid*="add-ip" i]',
    '[data-testid*="addIp" i]',
    '[aria-label*="Add IP Address" i]',
  ]) || findControlByText([/add ip address/i, /add.*access list/i]);

const openAddDialog = async () => {
  const addButton = await waitFor(
    getAddButton,
    "the Add IP Address button"
  );

  addButton.click();
  return waitFor(getDialog, "the Add IP Address dialog");
};

const openEditDialog = async (row) => {
  let editButton =
    queryFirst(
      [
        ".js-edit-entry",
        '[data-testid*="edit" i]',
        '[aria-label*="edit" i]',
        '[title*="edit" i]',
      ],
      row
    ) || findControlByText([/^edit$/i, /edit.*ip/i], row);

  // Some Atlas table variants put Edit inside a per-row actions menu.
  if (!editButton) {
    const menuButton = queryFirst(
      [
        'button[aria-haspopup="menu"]',
        '[aria-label*="actions" i]',
        '[aria-label*="more" i]',
        '[data-testid*="menu" i]',
      ],
      row
    );
    if (menuButton) {
      menuButton.click();
      editButton = await waitFor(
        () => findControlByText([/^edit$/i, /edit.*ip/i]),
        "the Edit menu item"
      );
    }
  }

  if (!editButton) {
    throw new Error("Found the access-list entry, but could not find its Edit control.");
  }

  editButton.click();
  return waitFor(getDialog, "the Edit IP Address dialog");
};

const submitDialog = async (dialog) => {
  const submitButton = await waitFor(
    () => {
      const button =
        queryFirst(
        [
          '[data-testid="lg-confirmation_modal-footer-confirm_button"]',
          'button[type="submit"]',
          '[data-testid*="confirm" i]',
          '[data-testid*="save" i]',
        ],
        dialog
        ) || findControlByText([/^save$/i, /^confirm$/i, /^add.*address$/i], dialog);
      const disabled =
        button?.disabled || button?.getAttribute("aria-disabled") === "true";
      return button && !disabled ? button : null;
    },
    "an enabled dialog confirmation button"
  );

  submitButton.click();
  await waitFor(() => {
    const alert = dialog.querySelector(
      '[role="alert"], [data-testid*="error" i], [class*="error" i]'
    );
    const errorMessage = normalizeText(alert?.textContent);
    if (errorMessage) throw new Error(`Atlas rejected the update: ${errorMessage}`);

    return (
      !document.contains(dialog) ||
      dialog.hidden ||
      dialog.getAttribute("aria-hidden") === "true"
    );
  }, "Atlas to save the access-list entry");
};

const navigateToAccessList = async () => {
  if (window.location.hash !== ACCESS_LIST_HASH) {
    window.location.hash = ACCESS_LIST_HASH;
  }

  await waitFor(
    () => window.location.hash === ACCESS_LIST_HASH,
    "the Network Access page"
  );
};

const upsertIpEntry = async ({ name, ip }) => {
  const normalizedName = normalizeText(name);
  const normalizedIp = normalizeText(ip);

  if (!normalizedName) throw new Error("Enter a name for the access-list entry.");
  if (!normalizedIp) throw new Error("Enter an IP address or CIDR range.");

  await navigateToAccessList();

  await waitFor(
    () =>
      getAddButton() &&
      document.querySelector(
        'tbody, [role="table"], [role="grid"], [data-testid*="empty" i]'
      ),
    "the Network Access list"
  );
  const row = findEntryRow(normalizedName);

  const dialog = row ? await openEditDialog(row) : await openAddDialog();
  const ipInput = await waitFor(() => getIpInput(dialog), "the IP address field");
  setInputValue(ipInput, normalizedIp);

  const commentInput = getCommentInput(dialog);
  if (commentInput) setInputValue(commentInput, normalizedName);

  await submitDialog(dialog);
  return { operation: row ? "updated" : "added" };
};

const handleMessage = (request, _sender, sendResponse) => {
  if (request?.action !== "UPSERT_IP_ENTRY") return false;

  upsertIpEntry(request.values)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((error) => {
      console.error("Mongo IP Updater:", error);
      sendResponse({ ok: false, error: error.message });
    });

  // Keep the message channel open while Atlas renders and the upsert completes.
  return true;
};

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(handleMessage);
}

if (typeof module !== "undefined") {
  module.exports = {
    ACCESS_LIST_HASH,
    findEntryRow,
    handleMessage,
    normalizeText,
    queryFirst,
    setInputValue,
  };
}
