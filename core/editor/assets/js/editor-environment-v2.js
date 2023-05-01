if ( ! window.__UNSTABLE__elementorPackages?.settings ) {
	throw new Error( 'The "@elementor/settings" package was not loaded.' );
}

window.__UNSTABLE__elementorPackages.settings.setSettings( window.elementorEditorV2Settings );
