const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findEntryRow,
  normalizeText,
  queryFirst,
  setInputValue,
} = require("../src/content.js");

test("normalizeText trims and collapses whitespace", () => {
  assert.equal(normalizeText("  Home  office\n IP  "), "Home office IP");
  assert.equal(normalizeText(undefined), "");
});

test("queryFirst uses selector fallbacks in priority order", () => {
  const expected = {};
  const root = {
    querySelector(selector) {
      return selector === "[aria-label]" ? expected : null;
    },
  };

  assert.equal(queryFirst(["[data-testid]", "[aria-label]"], root), expected);
});

test("setInputValue notifies controlled inputs", () => {
  const events = [];
  const input = {
    _value: "old",
    dispatchEvent(event) {
      events.push(event.type);
    },
  };
  Object.setPrototypeOf(input, {
    set value(value) {
      this._value = value;
    },
    get value() {
      return this._value;
    },
  });

  setInputValue(input, "203.0.113.8");

  assert.equal(input.value, "203.0.113.8");
  assert.deepEqual(events, ["input", "change"]);
});

test("findEntryRow matches an exact normalized cell value", () => {
  const matchingRow = {
    querySelectorAll() {
      return [{ textContent: " Home   office IP " }];
    },
  };
  const otherRow = {
    querySelectorAll() {
      return [{ textContent: "Home office IP backup" }];
    },
  };
  global.document = {
    querySelectorAll() {
      return [otherRow, matchingRow];
    },
  };

  assert.equal(findEntryRow("Home office IP"), matchingRow);
  delete global.document;
});
