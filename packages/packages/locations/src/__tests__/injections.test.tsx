import { render } from '@testing-library/react';
import { lazy } from 'react';
import { injectInto } from '../injections';
import Slot from '../components/slot';

describe( '@elementor/locations injections', () => {
	it( 'should render components based on the location name', () => {
		injectInto( {
			name: 'test-1',
			location: 'test',
			filler: () => <div data-testid="element">First div</div>,
		} );

		injectInto( {
			name: 'test-2',
			location: 'test',
			filler: () => <div data-testid="element">Second div</div>,
		} );
		injectInto( {
			name: 'test-3',
			location: 'test2',
			filler: () => <div data-testid="element">Should not exists</div>,
		} );

		const { getAllByTestId } = render( <Slot location="test" /> );

		const elements = getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 2 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
	} );

	it( 'should render components based on priority', () => {
		injectInto( {
			name: 'test-1',
			location: 'test',
			filler: () => <div data-testid="element">Third div</div>,
		} );
		injectInto( {
			name: 'test-2',
			location: 'test',
			filler: () => <div data-testid="element">First div</div>,
			options: { priority: 5 },
		} );
		injectInto( {
			name: 'test-3',
			location: 'test',
			filler: () => <div data-testid="element">Second div</div>,
			options: { priority: 5 },
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
		injectInto( {
			name: 'test-1',
			location: 'test',
			filler: () => <div>First div</div>,
		} );

		injectInto( {
			name: 'test-2',
			location: 'test',
			filler: lazy( () => Promise.resolve( {
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
