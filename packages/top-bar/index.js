import { lazy } from 'react';
import elementorLocations from '@elementor/locations';

console.log( 'loaded: editor-top-bar' );

elementorLocations.register( 'editor/top', lazy( () => {
	console.log( 'lazy: editor-top-bar' );

	return import( './components/top-bar' );
} ) );
