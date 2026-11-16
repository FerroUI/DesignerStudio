// The site of Designer Studio in headless Chrome, with real pointer input: it loads and draws, and
// a click on the Preview button of the toolbar opens the preview without an error.
// Usage: node DesignerStudio.Browser/tests/browser-smoke.mjs <site>
// The CI runs it after the site is built, with the Chrome of the runner (FerroUI's browser harness).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { open, run, assert, sleep, colours, differing } from "../../FerroUI/scripts/browser/harness.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetDir = process.env.CARGO_TARGET_DIR ? path.resolve(process.env.CARGO_TARGET_DIR) : path.join(root, "target");
const site = process.argv[2] ?? path.join(targetDir, "browser/designer-studio-browser");
const captures = path.join(targetDir, "designer-studio-browser-smoke");

// The fixed viewport of the test, in CSS pixels.
const width = 1280;
const height = 800;
// The Preview button, at the right end of the top toolbar of the workspace. The page is one canvas,
// so the button has no selector: its centre was read from a screenshot of the site at this
// viewport (the label "Preview" right of the toolbar's layout buttons), and it stays there because
// the toolbar is laid out from the right edge of the view.
const preview = { x: 1229, y: 21 };

// The console errors and uncaught exceptions of the page; a panic of the module prints
// "panicked at" to the console.
function failures(page) {
    return page.errors.concat(page.log.filter((line) => line.includes("panicked at")));
}

const page = await open(site, { width, height });
await page.resize(width, height);

await run([
    ["the site loads and draws without errors", async () => {
        await page.waitForView(1500);
        const shot = await page.screenshot(path.join(captures, "loaded.png"));
        assert(colours(shot) > 16, "the view drew nothing");
        assert(failures(page).length === 0, `errors after loading:\n${failures(page).join("\n")}`);
    }],
    ["a click on Preview opens the preview without an error", async () => {
        const before = await page.screenshot();
        await page.click(preview.x, preview.y);
        await sleep(2000);
        const after = await page.screenshot(path.join(captures, "preview.png"));
        assert(failures(page).length === 0, `errors after the click on Preview:\n${failures(page).join("\n")}`);
        const { different } = differing(before, after);
        assert(different > 0, "the view did not change after the click on Preview");
        // The application still responds: it draws the next frames.
        await page.mouseMove(640, 400);
        await sleep(500);
        assert(failures(page).length === 0, `errors after the preview opened:\n${failures(page).join("\n")}`);
    }],
]);
