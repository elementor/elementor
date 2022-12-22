import { lazy } from 'react';
import { addFiller } from '@elementor/locations';
import { locations } from '@elementor/editor';

addFiller( {
	location: locations.TOP,
	component: lazy( () => import( './components/top-bar' ) ),
} );
