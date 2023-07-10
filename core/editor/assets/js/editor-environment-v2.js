if ( ! window.__UNSTABLE__elementorPackages?.env ) {
	throw new Error( 'The "@elementor/env" package was not loaded.' );
}

window.__UNSTABLE__elementorPackages.env.initEnv( window.elementorEditorV2Env );
