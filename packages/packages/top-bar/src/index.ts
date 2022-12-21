import React from 'react';
import elementorLocations from '@elementor/locations';

elementorLocations.register(
	'editor/top',
	React.lazy( () => import( './components/top-bar' ) ),
);
