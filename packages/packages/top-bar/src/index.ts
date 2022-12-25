import { lazy } from 'react';
import { addEditorTopFill } from '@elementor/editor';

addEditorTopFill( {
	component: lazy( () => import( './components/top-bar' ) ),
} );
