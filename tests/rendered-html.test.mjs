import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

// Route table is the single source of truth in app/site-meta.ts.
const ROUTES = [
  ...readFileSync(new URL("../app/site-meta.ts", import.meta.url), "utf8")
    .split("export const PAGES:Record<string,[string,string]>={")[1]
    .split("\nexport const ROUTES")[0]
    .matchAll(/^"([^"]+)":\[/gm),
].map((m) => m[1]);

const RETIRED = ["/solutions", "/technology-delivery", "/attorney-intake"];
const NOINDEX = ["/privacy", "/terms", "/accessibility", "/confidentiality"];
const STATES = ["Georgia", "Florida", "North Carolina", "Tennessee", "South Carolina"];

const META_SRC = readFileSync(new URL("../app/site-meta.ts", import.meta.url), "utf8");
const description = (html) =>
  html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function get(worker, path) {
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const title = (html) => html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";

test("route table covers the expected pages", () => {
  assert.equal(ROUTES.length, 17);
  assert.equal(ROUTES[0], "/");
  for (const p of ["/services", "/service-areas", "/faq", "/about", "/contact"]) {
    assert.ok(ROUTES.includes(p), `${p} missing from route table`);
  }
  for (const p of RETIRED) {
    assert.ok(!ROUTES.includes(p), `${p} should have been retired`);
  }
});

// The codex-preview tag is injected by the hosted preview platform, not by this
// project, so the assertion only applies when running inside that environment.
test("renders development preview metadata", async (t) => {
  const response = await get(await loadWorker(), "/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  if (!/codex-preview/i.test(html)) {
    t.skip("no preview metadata injected outside the hosted preview environment");
    return;
  }
  assert.match(html, developmentPreviewMeta);
});

test("every route renders with a distinct, non-empty title", async () => {
  const worker = await loadWorker();
  const seen = new Map();
  for (const path of ROUTES) {
    const response = await get(worker, path);
    assert.equal(response.status, 200, `${path} did not return 200`);
    const html = await response.text();
    const t = title(html);
    assert.ok(t.length > 0, `${path} has no <title>`);
    assert.ok(t.includes("Allen Legal Nurse Consultants"), `${path} title missing firm name: ${t}`);
    assert.ok(!seen.has(t), `duplicate title on ${path} and ${seen.get(t)}: ${t}`);
    seen.set(t, path);
    assert.match(html, /<meta[^>]+name=["']description["'][^>]*>/i, `${path} has no meta description`);
  }
});

test("retired routes fall through to the not-found page", async () => {
  const worker = await loadWorker();
  for (const path of RETIRED) {
    const html = await (await get(worker, path)).text();
    assert.match(html, /Page not found/i, `${path} still renders content`);
  }
});

test("no phone number appears anywhere on the site", async () => {
  const worker = await loadWorker();
  for (const path of ROUTES) {
    const html = await (await get(worker, path)).text();
    assert.ok(!/tel:/i.test(html), `${path} still contains a tel: link`);
    assert.ok(!/404[).\s-]*989[.\s-]*7274/.test(html), `${path} still contains the phone number`);
  }
});

test("organization structured data is present on every page", async () => {
  const worker = await loadWorker();
  for (const path of ROUTES) {
    const html = await (await get(worker, path)).text();
    assert.match(html, /application\/ld\+json/, `${path} is missing JSON-LD`);
    assert.match(html, /"ProfessionalService"/, `${path} is missing organization schema`);
  }
});

test("the five service areas are named on the key pages", async () => {
  const worker = await loadWorker();
  for (const path of ["/", "/about", "/service-areas", "/faq", "/contact"]) {
    const html = await (await get(worker, path)).text();
    for (const s of STATES) {
      assert.ok(html.includes(s), `${path} does not mention ${s}`);
    }
  }
});

test("titles and descriptions stay within search-result limits", async () => {
  const worker = await loadWorker();
  for (const path of ROUTES) {
    const html = await (await get(worker, path)).text();
    const t = title(html);
    const d = description(html);
    // Google truncates titles near 60 chars; 70 is the hard cap, with the
    // keyword placed first so truncation only ever clips the brand.
    assert.ok(t.length <= 70, `${path} title is ${t.length} chars: ${t}`);
    assert.ok(d.length >= 140 && d.length <= 160, `${path} description is ${d.length} chars`);
  }
});

test("placeholder legal pages are noindex and absent from the sitemap", async () => {
  const worker = await loadWorker();
  const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  for (const path of NOINDEX) {
    const html = await (await get(worker, path)).text();
    assert.match(html, /<meta name="robots" content="noindex/i, `${path} is not noindex`);
    assert.ok(!sitemap.includes(`${path}<`), `${path} should not be in the sitemap while noindex`);
  }
  for (const path of ["/", "/services", "/service-areas", "/about", "/faq"]) {
    const html = await (await get(worker, path)).text();
    assert.ok(!/content="noindex/i.test(html), `${path} must stay indexable`);
  }
});

test("Person schema carries Bianca's credentials for E-E-A-T", async () => {
  const html = await (await get(await loadWorker(), "/about")).text();
  assert.match(html, /"Person"/);
  assert.match(html, /"hasCredential"/);
  assert.match(html, /NEA-BC/);
  assert.match(html, /linkedin\.com/);
});

test("each service area section carries substantive unique content", async () => {
  const html = await (await get(await loadWorker(), "/service-areas")).text();
  // Thin, near-duplicate location sections are doorway pages under Google's
  // spam policy. Each state needs its own genuine substance.
  const body = html.split("<main")[1].replace(/<[^>]*>/g, " ");
  for (const s of STATES) {
    assert.ok(body.includes(s), `${s} section missing`);
  }
  const words = body.split(/\s+/).filter(Boolean).length;
  assert.ok(words > 900, `service areas page has only ~${words} words, too thin for 5 states`);
  // Each state's distinct pre-suit rule is what makes the sections non-duplicative.
  for (const cite of ["9-11-9.1", "766.203", "9(j)", "29-26-122", "15-79-125"]) {
    assert.ok(html.includes(cite), `missing the state-specific citation ${cite}`);
  }
  assert.match(html, /does not provide that affidavit/i, "missing the scope-of-role disclaimer");
});

test("the route table and sitemap agree", () => {
  const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const locs = [...sitemap.matchAll(/<loc>https:\/\/allenlegalnurses\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  const expected = ROUTES.filter((r) => !NOINDEX.includes(r));
  assert.deepEqual(locs.sort(), expected.sort());
  assert.ok(META_SRC.includes("export const NOINDEX"), "NOINDEX set missing from site-meta.ts");
});

test("the FAQ page publishes FAQPage structured data", async () => {
  const html = await (await get(await loadWorker(), "/faq")).text();
  assert.match(html, /"FAQPage"/);
  assert.match(html, /"acceptedAnswer"/);
});

test("no page links to a downloads PDF while downloads are disabled", async () => {
  const html = await (await get(await loadWorker(), "/resources")).text();
  assert.ok(!/href="\/downloads\//.test(html), "resources links to PDFs that do not exist yet");
  assert.match(html, /Request by email/i);
});
