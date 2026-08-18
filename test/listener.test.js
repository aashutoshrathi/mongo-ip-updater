const test = require("node:test");
const assert = require("node:assert/strict");

let registeredListener;
global.chrome = {
  runtime: {
    onMessage: {
      addListener(listener) {
        registeredListener = listener;
      },
    },
  },
};

const { handleMessage } = require("../src/content.js");

test("registers the message listener as soon as the content script loads", () => {
  assert.equal(registeredListener, handleMessage);
  assert.equal(registeredListener({ action: "OTHER" }), false);
});

test.after(() => {
  delete global.chrome;
});
