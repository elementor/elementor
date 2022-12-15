import { lazy } from 'react';
import elementorLocations from '@elementor/locations'; // TODO: Fix ts-error.

console.log( 'loaded: editor-top-bar' );

elementorLocations.register( 'editor/top', lazy( () => {
	console.log( 'lazy: editor-top-bar' );

	return import( './components/top-bar' );
} ) );
