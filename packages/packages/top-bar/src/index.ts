import { lazy } from 'react';
import elementorLocations from '@elementor/locations'; // TODO: Fix ts-error.

console.log( 'loaded: editor-top-bar' );

// TODO: Remove the lazy, or maybe wrap the whole app with <Suspense /> and check if it helps with dynamically
//  imported components that should appear on load.
elementorLocations.register( 'editor/top', lazy( () => {
	console.log( 'lazy: editor-top-bar' );

	return import( './components/top-bar' );
} ) );
