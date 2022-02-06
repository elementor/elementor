import { render } from '@testing-library/react';
import { ItemIndicatorList } from 'elementor-regions/navigator/components';

describe( '<ItemIndicator />', () => {
	it( 'Should render indicators when corresponding settings are filled', () => {
		const settings = {
				_position: 'filled',
				custom_css: 'filled',
				motion_fx_motion_fx_scrolling: 'filled',
			},
			component = render(
				<ItemIndicatorList settings={ settings } />
			);

		expect(
			component.queryAllByRole( 'item-indicator' ).length
		).toEqual( 3 );
	} );

	it( 'Should not render indicators when corresponding settings are not filled', () => {
		const settings = {},
			component = render(
				<ItemIndicatorList settings={ settings } />
			);

		expect(
			component.queryAllByRole( 'item-indicator' ).length
		).toEqual( 0 );
	} );
} );
