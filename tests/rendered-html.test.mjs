import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the GoC companion learning site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>魔法画笔 GoC 陪读探险站<\/title>/i);
  assert.match(html, /提高组决赛备赛站/);
  assert.match(html, /决赛能力路线/);
  assert.match(html, /真实运行/);
  assert.match(html, /6道决赛编程路线/);
  assert.match(html, /真实运行画布/);
  assert.match(html, /决赛题型复习/);
  assert.match(html, /坐标与路径/);
  assert.match(html, /5类题型 · 20道样题/);
});

test("keeps the finished site free of starter preview metadata", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
