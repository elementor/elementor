import { collectHardcodedColors } from '../collect-hardcoded-colors';

describe( 'collectHardcodedColors', () => {
	it( 'collects a top-level hex color with path', () => {
		const settings = { title_color: '#6EC1E4' };

		expect( collectHardcodedColors( settings ) ).toEqual( [ { path: 'title_color', value: '#6EC1E4' } ] );
	} );

	it( 'collects nested repeater colors', () => {
		const settings = {
			tabs: [
				{ tab_title: 'One', title_color: '#111111', _id: 'a' },
				{ tab_title: 'Two', title_color: '#222222', _id: 'b' },
			],
		};

		expect( collectHardcodedColors( settings ) ).toEqual( [
			{ path: 'tabs[0].title_color', value: '#111111' },
			{ path: 'tabs[1].title_color', value: '#222222' },
		] );
	} );

	it( 'skips settings linked via __globals__', () => {
		const settings = {
			title_color: '#6EC1E4',
			__globals__: { title_color: 'globals/colors?id=primary' },
		};

		expect( collectHardcodedColors( settings ) ).toEqual( [] );
	} );

	it( 'skips globals/ color references', () => {
		const settings = { title_color: 'globals/colors?id=primary' };

		expect( collectHardcodedColors( settings ) ).toEqual( [] );
	} );

	it( 'ignores non-color strings', () => {
		const settings = { typography: 'custom', width: '100px' };

		expect( collectHardcodedColors( settings ) ).toEqual( [] );
	} );

	it( 'collects rgb and rgba strings', () => {
		const settings = {
			shadow_color: 'rgb(110, 193, 228)',
			overlay_color: 'rgba(110, 193, 228, 0.5)',
		};

		expect( collectHardcodedColors( settings ) ).toEqual( [
			{ path: 'shadow_color', value: 'rgb(110, 193, 228)' },
			{ path: 'overlay_color', value: 'rgba(110, 193, 228, 0.5)' },
		] );
	} );
} );
