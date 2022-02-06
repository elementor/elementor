import { render, fireEvent, waitFor } from '@testing-library/react';
import { ItemIndicator } from 'elementor-regions/navigator/components';

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

	it( 'Should display tispy tooltip on hover', async () => {
		const component = render(
			<ItemIndicator indicator={ indicator } />
		);

		fireEvent.mouseEnter(
			component.queryByRole( 'item-indicator' )
		);

		await waitFor(
			() => expect(
				component.queryByText( indicator.title )
			).toBeInTheDocument()
		);
	} );

	it( 'Should activate section on click', () => {
		const handleActivateSection = jest.fn(),
			component = render(
				<ItemIndicator indicator={ indicator } onActivateSection={ handleActivateSection } />
			);

		fireEvent.click(
			component.queryByRole( 'item-indicator' )
		);

		expect( handleActivateSection ).toBeCalledTimes( 1 );
		expect( handleActivateSection ).toBeCalledWith( indicator.section );
	} );
} );
