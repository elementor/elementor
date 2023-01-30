import { render } from '@testing-library/react';
import { lazy } from 'react';
import { inject, getInjectionsOf } from '../injections';
import Slot from '../components/slot';

describe( '@elementor/locations injections', () => {
	it( 'should render components based on the location name', () => {
		// Arrange.
		inject( {
			name: 'test-1',
			location: 'test',
			filler: () => <div data-testid="element">First div</div>,
		} );

		inject( {
			name: 'test-2',
			location: 'test',
			filler: () => <div data-testid="element">Second div</div>,
		} );

		inject( {
			name: 'test-3',
			location: 'test2',
			filler: () => <div data-testid="element">Should not exist</div>,
		} );

		// Act.
		const { getAllByTestId } = render( <Slot location="test" /> );

		// Assert.
		const elements = getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 2 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
	} );

	it( 'should render components based on priority', () => {
		// Arrange.
		inject( {
			name: 'test-1',
			location: 'test',
			filler: () => <div data-testid="element">Third div</div>,
			// Default priority is 10.
		} );

		inject( {
			name: 'test-2',
			location: 'test',
			filler: () => <div data-testid="element">First div</div>,
			options: { priority: 5 },
		} );

		inject( {
			name: 'test-3',
			location: 'test',
			filler: () => <div data-testid="element">Second div</div>,
			options: { priority: 5 },
		} );

		// Act.
		const { getAllByTestId } = render( <Slot location="test" /> );

		// Assert.
		const elements = getAllByTestId( 'element' );

		expect( elements ).toHaveLength( 3 );
		expect( elements[ 0 ].innerHTML ).toBe( 'First div' );
		expect( elements[ 1 ].innerHTML ).toBe( 'Second div' );
		expect( elements[ 2 ].innerHTML ).toBe( 'Third div' );
	} );

	it( 'should render empty slot when there are no fills', () => {
		// Arrange + Act.
		const { container } = render( <Slot location="empty" /> );

		// Assert.
		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'should render lazy components', async () => {
		// Arrange.
		inject( {
			name: 'test-1',
			location: 'test',
			filler: () => <div>First div</div>,
		} );

		inject( {
			name: 'test-2',
			location: 'test',
			filler: lazy( () => Promise.resolve( {
				default: () => <div>Second div</div>,
			} ) ),
		} );

		// Act.
		const { queryByText, findByText } = render( <Slot location="test" /> );

		// Assert.
		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeNull();

		// Waits for the lazy component to be loaded.
		await findByText( 'Second div' );

		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeTruthy();
	} );

	it( 'should error when injecting filler with the same name (without overwrite option)', async () => {
		// Arrange.
		inject( {
			name: 'test',
			location: 'test',
			filler: () => <div>First div</div>,
		} );

		inject( {
			name: 'test',
			location: 'test',
			filler: () => <div>Second div</div>,
		} );

		// Act
		const { queryByText } = render( <Slot location="test" /> );

		// Assert.
		expect( queryByText( 'First div' ) ).toBeTruthy();
		expect( queryByText( 'Second div' ) ).toBeNull();
		expect( console ).toHaveErrored();
	} );

	it( 'should overwrite the filler if has same name', async () => {
		// Arrange.
		inject( {
			name: 'test',
			location: 'test',
			filler: () => <div>First div</div>,
		} );

		inject( {
			name: 'test',
			location: 'test',
			filler: () => <div>Second div</div>,
			options: { overwrite: true },
		} );

		inject( {
			name: 'test-2',
			location: 'test',
			filler: () => <div>Third div</div>,
			options: { overwrite: true },
		} );

		// Act
		const { queryByText } = render( <Slot location="test" /> );

		// Assert.
		expect( queryByText( 'First div' ) ).toBeNull();
		expect( queryByText( 'Second div' ) ).toBeTruthy();
		expect( queryByText( 'Third div' ) ).toBeTruthy();
	} );

	it( 'should overwrite the injection priority', () => {
		// Arrange.
		inject( {
			name: 'test-1',
			location: 'test',
			filler: () => <div />,
			options: { priority: 5 },
		} );

		inject( {
			name: 'test-1',
			location: 'test',
			filler: () => <div />,
			options: { overwrite: true },
		} );

		// Act + Assert.
		expect( getInjectionsOf( 'test' ) ).toHaveLength( 1 );
		expect( getInjectionsOf( 'test' )[ 0 ].priority ).toBe( 10 );
	} );

	it( 'should catch filler errors with error boundary', () => {
		// Arrange.
		inject( {
			name: 'test-1',
			location: 'test',
			filler: () => <div>Test 1</div>,
		} );

		inject( {
			name: 'test-2',
			location: 'test',
			filler: () => {
				throw new Error( 'Error' );
			},
		} );

		inject( {
			name: 'test-3',
			location: 'test',
			filler: () => <div>Test 3</div>,
		} );

		// Act.
		const { queryByText } = render( <Slot location="test" /> );

		// Assert.
		expect( queryByText( 'Test 1' ) ).toBeTruthy();
		expect( queryByText( 'Test 3' ) ).toBeTruthy();
		expect( console ).toHaveErrored();
	} );
} );
