import * as React from 'react';
import { lazy } from 'react';
import { render, screen } from '@testing-library/react';

import { createLocation } from '../create-location';

describe( 'createLocation', () => {
	it( 'should render components based on the location name', () => {
		// Arrange.
		const { inject: injectIntoTest, Slot: TestSlot } = createLocation();
		const { inject: injectIntoTest2 } = createLocation();

		injectIntoTest( {
			id: 'test-1',
			component: () => <div data-testid="element">First div</div>,
		} );

		injectIntoTest( {
			id: 'test-2',
			component: () => <div data-testid="element">Second div</div>,
		} );

		injectIntoTest2( {
			id: 'test-3',
			component: () => <div data-testid="element">Should not exist</div>,
		} );

		// Act.
		render( <TestSlot /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		const elements = screen.getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 2 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
	} );

	it( 'should render components based on priority', () => {
		// Arrange.
		const { inject, Slot } = createLocation();

		inject( {
			id: 'test-1',
			component: () => <div data-testid="element">Third div</div>,
			// Default priority is 10.
		} );

		inject( {
			id: 'test-2',
			component: () => <div data-testid="element">First div</div>,
			options: { priority: 5 },
		} );

		inject( {
			id: 'test-3',
			component: () => <div data-testid="element">Second div</div>,
			options: { priority: 5 },
		} );

		// Act.
		render( <Slot /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		const elements = screen.getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 3 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
		expect( elements[ 2 ].innerHTML ).toBe( 'Third div' );
	} );

	it( 'should render empty slot when there are no fills', () => {
		// Arrange.
		const { Slot } = createLocation();

		// Act.
		const { container } = render( <Slot /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render lazy components', async () => {
		// Arrange.
		const { inject, Slot } = createLocation();

		inject( {
			id: 'test-1',
			component: () => <div>First div</div>,
		} );

		inject( {
			id: 'test-2',
			component: lazy( () =>
				Promise.resolve( {
					default: () => <div>Second div</div>,
				} )
			),
		} );

		// Act.
		render( <Slot /> );

		// Assert.
		expect( screen.getByText( 'First div' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Second div' ) ).not.toBeInTheDocument();

		// Waits for the lazy component to be loaded.
		await screen.findByText( 'Second div' );

		expect( screen.getByText( 'First div' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Second div' ) ).toBeInTheDocument();
	} );

	it( 'should error when injecting a component with the same name (without overwrite option)', async () => {
		// Arrange.
		const { inject, Slot } = createLocation();

		inject( {
			id: 'test',
			component: () => <div>First div</div>,
		} );

		inject( {
			id: 'test',
			component: () => <div>Second div</div>,
		} );

		// Act
		render( <Slot /> );

		// Assert.
		expect( screen.getByText( 'First div' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Second div' ) ).not.toBeInTheDocument();
		expect( console ).toHaveWarned();
	} );

	it( 'should overwrite the injected component if has same name', async () => {
		// Arrange.
		const { inject, Slot } = createLocation();

		inject( {
			id: 'test',
			component: () => <div>First div</div>,
		} );

		inject( {
			id: 'test',
			component: () => <div>Second div</div>,
			options: { overwrite: true },
		} );

		inject( {
			id: 'test-2',
			component: () => <div>Third div</div>,
			options: { overwrite: true },
		} );

		// Act
		render( <Slot /> );

		// Assert.
		expect( screen.queryByText( 'First div' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Second div' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Third div' ) ).toBeInTheDocument();
	} );

	it( 'should overwrite the injection priority', () => {
		// Arrange.
		const { inject, getInjections } = createLocation();

		inject( {
			id: 'test-1',
			component: () => <div />,
			options: { priority: 5 },
		} );

		inject( {
			id: 'test-1',
			component: () => <div />,
			options: { overwrite: true },
		} );

		// Act + Assert.
		expect( getInjections() ).toHaveLength( 1 );
		expect( getInjections()[ 0 ].priority ).toBe( 10 );
	} );

	it( 'should catch injected component errors with error boundary', () => {
		// Arrange.
		const { inject, Slot } = createLocation();

		inject( {
			id: 'test-1',
			component: () => <div>Test 1</div>,
		} );

		inject( {
			id: 'test-2',
			component: () => {
				throw new Error( 'Error' );
			},
		} );

		inject( {
			id: 'test-3',
			component: () => <div>Test 3</div>,
		} );

		// Act.
		render( <Slot /> );

		// Assert.
		expect( screen.getByText( 'Test 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test 3' ) ).toBeInTheDocument();
		expect( console ).toHaveErrored();
	} );

	it( 'should pass the props from Slot to the injected component', () => {
		// Arrange.
		const { inject, Slot } = createLocation< { text: string; number: number } >();

		inject( {
			id: 'test-1',
			component: ( { text, number } ) => (
				<div>
					{ text }: { number }
				</div>
			),
		} );

		// Act.
		render( <Slot text="The number is" number={ 1 } /> );

		// Assert.
		expect( screen.getByText( 'The number is: 1' ) ).toBeInTheDocument();
	} );
} );
