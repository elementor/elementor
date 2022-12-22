import { render } from '@testing-library/react';
import { lazy } from 'react';
import { addFiller, resetFillers, Slot } from '../index';

describe( '@elementor/locations API', () => {
	beforeEach( () => {
		resetFillers();
	} );

	it( 'should render components based on the location name', () => {
		addFiller( {
			location: 'test',
			component: () => <div data-testid="element">Second div</div>,
			priority: 20,
		} );

		addFiller( {
			location: 'test',
			component: () => <div data-testid="element">First div</div>,
		} );

		addFiller( {
			location: 'test2',
			component: () => <div data-testid="element">Should not exists</div>,
		} );

		const { getAllByTestId } = render( <Slot name="test" /> );

		const elements = getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 2 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
	} );

	it( 'should render lazy components', async () => {
		addFiller( {
			location: 'test',
			component: () => <div>First div</div>,
		} );

		addFiller( {
			location: 'test',
			component: lazy( () => Promise.resolve( {
				default: () => <div>Second div</div>,
			} ) ),
		} );

		const { queryByText, findByText } = render( <Slot name="test" /> );

		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeNull();

		// Waits for the lazy component to be loaded.
		await findByText( 'Second div' );

		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeTruthy();
	} );
} );
