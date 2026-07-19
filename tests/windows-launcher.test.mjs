import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const launcher = await readFile(new URL("../启动GoC课程站.bat", import.meta.url), "utf8");

test("keeps the npm development commands compatible with Windows cmd", () => {
  for (const script of [packageJson.scripts.dev, packageJson.scripts.build, packageJson.scripts.start]) {
    assert.doesNotMatch(script, /WRANGLER_LOG_PATH=/);
    assert.match(script, /^vinext /);
  }
});

test("starts the Windows local server in a persistent command window", () => {
  assert.match(launcher, /cmd \/k "npm run dev -- --host 127\.0\.0\.1 --port %LOCAL_PORT% --strictPort"/);
  assert.match(launcher, /Invoke-WebRequest -UseBasicParsing/);
});

test("chooses and validates a numeric local port without a nested PowerShell pipe", () => {
  assert.doesNotMatch(launcher, /3000\.\.3999 \^\|/);
  assert.match(launcher, /while \(\$used -contains \$p\) \{ \$p\+\+ \}/);
  assert.match(launcher, /findstr \/r "\^\[0-9\]\[0-9\]\*\$"/);
});
