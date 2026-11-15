//! The browser host of FerroUI Designer Studio.
//!
//! Designer Studio is the sample `samples/DesignerStudio` of the FerroUI submodule, built from its
//! sources. The host page (`wwwroot/main.js`) creates the WebAssembly module, hands it to the script
//! side of the platform and calls [`run_main`] with the address of the page. The application class
//! of the sample (`designer_studio::App`) opens the starter document and makes its workspace the main
//! view of the single-view lifetime of the browser.
//!
//! The browser has no system fonts: the embedded Inter font is the default family. The query string
//! selects the renderer: `?RenderingMode=Software2D` draws without WebGL. Documents live in the
//! memory of the page for the time it is open.

#![cfg_attr(target_os = "emscripten", no_main)]

#[cfg(target_os = "emscripten")]
use wasm_bindgen::prelude::*;

#[cfg(target_os = "emscripten")]
#[wasm_bindgen(js_name = runMain)]
pub fn run_main(href: &str) {
    use ferroui_base::logging::LogEventLevel;
    use ferroui_base::media::FontManagerOptions;
    use ferroui_browser::{BrowserAppBuilder, BrowserPlatformOptions, BrowserRenderingMode};
    use ferroui_controls::AppBuilder;
    use ferroui_fonts_inter::AppBuilderExtension;
    use std::rc::Rc;

    let mut options = BrowserPlatformOptions::default();
    if href.contains("RenderingMode=Software2D") {
        options.rendering_mode = vec![BrowserRenderingMode::Software2D];
    }
    AppBuilder::configure::<designer_studio::App>()
        .with_inter_font()
        .with(Rc::new(FontManagerOptions {
            default_family_name: Some("fonts:Inter#Inter".to_owned()),
            ..Default::default()
        }))
        .log_to_text_writer(std::io::stdout(), LogEventLevel::Warning, &[])
        .start_browser_app("out", Some(options));
}

#[cfg(not(target_os = "emscripten"))]
fn main() {
    println!(
        "Build the browser site with: FERROUI_BROWSER_WORKSPACE=$PWD FerroUI/scripts/build-browser.sh designer-studio-browser"
    );
}
