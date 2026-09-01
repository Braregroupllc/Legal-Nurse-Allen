import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

// Route table is the single source of truth in app/site-meta.ts.
const META_SRC = readFileSync(new URL("../app/site-meta.ts", import.meta.url), "utf8");
const ROUTES = [
  ...META_SRC.split("export const PAGES:Record<string,[string,string]>={")[1]
    .split("\nexport const ROUTES")[0]
    .matchAll(/^"([^"]+)":\[/gm),
].map((m) => m[1]);

const RETIRED = [
  "/solutions", "/technology-delivery", "/attorney-intake",
  "/privacy", "/terms", "/accessibility", "/confidentiality",
];
const STATES = ["Georgia", "Florida", "North Carolina", "Tennessee", "South Carolina"];

const PORT = 4399;
const BASE = `http://localhost:${PORT}`;
let server;

before(async () => {
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: new URL("..", import.meta.url),
    stdio: ["ignore", "pipe", "pipe"],
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/`, { headers: { accept: "text/html" } });
      if (r.status === 200) return;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 500));
  }
  throw new Error("next start did not become ready within 60s (run `next build` first)");
});

after(() => {
  server?.kill("SIGTERM");
});

const get = (path) => fetch(`${BASE}${path}`, { headers: { accept: "text/html" } });
const title = (html) => html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";
const description = (html) =>
  html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "";

test("route table covers the expected pages", () => {
  assert.equal(ROUTES.length, 13);
  assert.equal(ROUTES[0], "/");
  for (const p of ["/services", "/service-areas", "/faq", "/about", "/contact"]) {
    assert.ok(ROUTES.includes(p), `${p} missing from route table`);
  }
  for (const p of RETIRED) {
    assert.ok(!ROUTES.includes(p), `${p} should not be a route`);
  }
});

test("every route renders with a distinct, non-empty title and a description", async () => {
  const seen = new Map();
  for (const path of ROUTES) {
    const response = await get(path);
    assert.equal(response.status, 200, `${path} did not return 200`);
    const html = await response.text();
    const t = title(html);
    assert.ok(t.length > 0, `${path} has no <title>`);
    assert.ok(t.includes("Allen Legal Nurse Consultants"), `${path} title missing firm name: ${t}`);
    assert.ok(!seen.has(t), `duplicate title on ${path} and ${seen.get(t)}: ${t}`);
    seen.set(t, path);
    assert.match(html, /<meta name="description" content="[^"]+"/i, `${path} has no meta description`);
  }
});

test("titles and descriptions stay within search-result limits", async () => {
  for (const path of ROUTES) {
    const html = await (await get(path)).text();
    const t = title(html);
    const d = description(html);
    // Google truncates titles near 60 chars; 70 is the hard cap, with the
    // keyword placed first so truncation only ever clips the brand.
    assert.ok(t.length <= 70, `${path} title is ${t.length} chars: ${t}`);
    assert.ok(d.length >= 140 && d.length <= 160, `${path} description is ${d.length} chars`);
  }
});

test("retired routes redirect to their replacement", async () => {
  const map = {
    "/solutions": "/services",
    "/technology-delivery": "/services",
    "/attorney-intake": "/contact",
  };
  for (const [from, to] of Object.entries(map)) {
    const r = await fetch(`${BASE}${from}`, { redirect: "manual" });
    assert.ok([301, 308].includes(r.status), `${from} returned ${r.status}, expected a permanent redirect`);
    assert.equal(new URL(r.headers.get("location"), BASE).pathname, to, `${from} should redirect to ${to}`);
  }
  // A genuinely unknown path still 404s.
  assert.equal((await get("/no-such-page")).status, 404);
});

test("the removed legal pages are gone", async () => {
  for (const path of ["/privacy", "/terms", "/accessibility", "/confidentiality"]) {
    assert.equal((await get(path)).status, 404, `${path} should 404`);
  }
});

test("no phone number appears anywhere on the site", async () => {
  for (const path of ROUTES) {
    const html = await (await get(path)).text();
    assert.ok(!/tel:/i.test(html), `${path} still contains a tel: link`);
    assert.ok(!/404[).\s-]*989[.\s-]*7274/.test(html), `${path} still contains the phone number`);
  }
});

test("organization structured data is present on every page", async () => {
  for (const path of ROUTES) {
    const html = await (await get(path)).text();
    assert.match(html, /application\/ld\+json/, `${path} is missing JSON-LD`);
    assert.match(html, /"ProfessionalService"/, `${path} is missing organization schema`);
  }
});

test("the five service areas are named on the key pages", async () => {
  for (const path of ["/", "/about", "/service-areas", "/faq", "/contact"]) {
    const html = await (await get(path)).text();
    for (const s of STATES) {
      assert.ok(html.includes(s), `${path} does not mention ${s}`);
    }
  }
});

test("every route is indexable", async () => {
  for (const path of ROUTES) {
    const html = await (await get(path)).text();
    assert.ok(!/content="noindex/i.test(html), `${path} must not be noindex`);
  }
});

test("Person schema carries Bianca's credentials for E-E-A-T", async () => {
  const html = await (await get("/about")).text();
  assert.match(html, /"Person"/);
  assert.match(html, /"hasCredential"/);
  assert.match(html, /NEA-BC/);
  assert.match(html, /linkedin\.com/);
});

test("each service area section carries substantive unique content", async () => {
  const html = await (await get("/service-areas")).text();
  // Thin, near-duplicate location sections are doorway pages under Google's
  // spam policy. Each state needs its own genuine substance.
  const body = html.replace(/<[^>]*>/g, " ");
  for (const s of STATES) assert.ok(body.includes(s), `${s} section missing`);
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
  const locs = [
    ...sitemap.matchAll(/<loc>https:\/\/allenlegalnurses\.com([^<]*)<\/loc>/g),
  ].map((m) => m[1] || "/");
  assert.deepEqual(locs.sort(), [...ROUTES].sort());
});

test("the FAQ page publishes FAQPage structured data", async () => {
  const html = await (await get("/faq")).text();
  assert.match(html, /"FAQPage"/);
  assert.match(html, /"acceptedAnswer"/);
});

test("resources does not link to PDFs while downloads are disabled", async () => {
  const html = await (await get("/resources")).text();
  assert.ok(!/href="\/downloads\//.test(html), "resources links to PDFs that do not exist yet");
  assert.match(html, /Request by email/i);
});

test("robots.txt and sitemap.xml are served", async () => {
  assert.equal((await fetch(`${BASE}/robots.txt`)).status, 200);
  assert.equal((await fetch(`${BASE}/sitemap.xml`)).status, 200);
});
