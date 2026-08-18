const test = require("node:test");
const assert = require("node:assert/strict");

const manifest = require("../manifest.json");
const packageJson = require("../package.json");

test("package and extension versions stay in sync", () => {
  assert.equal(packageJson.version, manifest.version);
});
