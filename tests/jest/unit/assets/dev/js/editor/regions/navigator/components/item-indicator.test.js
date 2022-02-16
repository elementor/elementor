import { render, fireEvent } from '@testing-library/react';
import { ItemIndicator } from 'elementor-regions/navigator/components';

require( 'elementor/tests/jest/setup/editor' );

describe( '<ItemIndicator />', () => {
	const indicator = { title: 'item-indicator', icon: 'example', section: 'section-to-open' };

	it( 'Should render icon', () => {
		const component = render(
			<ItemIndicator indicator={ indicator } />
		);

		expect(
			component.container.querySelector( `.eicon-${ indicator.icon }` )
		).not.toBeNull();
	} );

	it( 'Should activate section on click', () => {
		const handleActivateSection = jest.fn(),
			component = render(
				<ItemIndicator indicator={ indicator } onActivateSection={ handleActivateSection } />
			);

		fireEvent.click(
			component.queryByRole( 'button' )
		);

		expect( handleActivateSection ).toBeCalledTimes( 1 );
		expect( handleActivateSection ).toBeCalledWith( indicator.section );
	} );
} );
