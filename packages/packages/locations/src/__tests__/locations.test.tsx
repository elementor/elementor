import { render } from '@testing-library/react';
import { lazy } from 'react';
import { addFill, resetFills } from '../locations';
import Slot from '../components/slot';

describe( '@elementor/locations locations', () => {
	beforeEach( () => {
		resetFills();
	} );

	it( 'should render components based on the location name', () => {
		addFill( {
			location: 'test',
			component: () => <div data-testid="element">First div</div>,
		} );

		addFill( {
			location: 'test',
			component: () => <div data-testid="element">Second div</div>,
		} );

		addFill( {
			location: 'test2',
			component: () => <div data-testid="element">Should not exists</div>,
		} );

		const { getAllByTestId } = render( <Slot location="test" /> );

		const elements = getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 2 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
	} );

	it( 'should render components based on priority', () => {
		addFill( {
			location: 'test',
			component: () => <div data-testid="element">Third div</div>,
		} );

		addFill( {
			location: 'test',
			component: () => <div data-testid="element">First div</div>,
			priority: 5,
		} );

		addFill( {
			location: 'test',
			component: () => <div data-testid="element">Second div</div>,
			priority: 5,
		} );

		const { getAllByTestId } = render( <Slot location="test" /> );

		const elements = getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 3 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
		expect( elements[ 2 ].innerHTML ).toBe( 'Third div' );
	} );

	it( 'should render empty slot when there are no fills', () => {
		const { container } = render( <Slot location="empty" /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'should render lazy components', async () => {
		addFill( {
			location: 'test',
			component: () => <div>First div</div>,
		} );

		addFill( {
			location: 'test',
			component: lazy( () => Promise.resolve( {
				default: () => <div>Second div</div>,
			} ) ),
		} );

		const { queryByText, findByText } = render( <Slot location="test" /> );

		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeNull();

		// Waits for the lazy component to be loaded.
		await findByText( 'Second div' );

		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeTruthy();
	} );
} );
