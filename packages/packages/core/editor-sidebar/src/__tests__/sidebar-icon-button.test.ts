import { type Theme } from '@elementor/ui';

import { editorChromeIconBorderRadiusSx, getSidebarIconButtonSx } from '../sidebar-icon-button';

describe( 'getSidebarIconButtonSx', () => {
	it( 'uses compact 28px control dimensions for default state', () => {
		expect( getSidebarIconButtonSx() ).toMatchObject( {
			borderRadius: expect.any( Function ),
			width: 28,
			height: 28,
			padding: '6px',
			color: 'grey.800',
			backgroundColor: 'transparent',
		} );
	} );

	it( 'applies selected styling when a toggle is active', () => {
		expect( getSidebarIconButtonSx( { selected: true } ) ).toMatchObject( {
			color: 'primary.main',
			backgroundColor: 'action.selected',
		} );
	} );

	it( 'returns px border radius matching editor chrome controls', () => {
		const theme = {
			shape: {
				borderRadius: 8,
				__unstableBorderRadiusMultipliers: [ 0, 0.75, 1, 1.5, 2.5 ],
			},
		} as Theme;

		expect( getSidebarIconButtonSx() ).toMatchObject( {
			borderRadius: expect.any( Function ),
		} );

		const { borderRadius } = editorChromeIconBorderRadiusSx as {
			borderRadius: ( t: Theme ) => string;
		};

		expect( borderRadius( theme ) ).toBe( '8px' );
	} );

	it( 'keeps selected background on hover when emphasized', () => {
		const sx = getSidebarIconButtonSx( { selected: true } );

		expect( sx ).toMatchObject( {
			'&:hover': {
				backgroundColor: 'action.selected',
			},
		} );
	} );
} );
