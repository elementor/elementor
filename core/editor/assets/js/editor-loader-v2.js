window.elementor.start();

if ( ! window.__UNSTABLE__elementorPackages ) {
    throw new Error( 'Elementor packages (including the editor package) was not loaded.' );
}

window.__UNSTABLE__elementorPackages
    .editor
    .init( document.getElementById( 'elementor-editor-wrapper-v2' ) );
