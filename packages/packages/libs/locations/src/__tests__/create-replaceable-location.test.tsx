import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { createReplaceableLocation } from '../create-replaceable-location';

describe( 'createReplaceableLocation', () => {
	it( 'should replace the component based on the first matching condition', () => {
		// Arrange.
		const { Slot } = createReplaceableLocation();

		// Act.
		render(
			<Slot>
				<div>Children</div>
			</Slot>
		);

		// Assert.
		expect( screen.getByText( 'Children' ) ).toBeInTheDocument();
	} );

	it( 'should replace the component based on the first matching condition', () => {
		// Arrange.
		const { inject, Slot } = createReplaceableLocation< { text: string; number: number } >();

		// Act.
		inject( {
			id: 'test-1',
			component: ( { text, number } ) => (
				<div>
					{ text }: { number }
				</div>
			),
			condition: ( { number } ) => number > 0,
		} );

		render(
			<Slot text="The number is" number={ 1 }>
				<div>Children</div>
			</Slot>
		);

		// Assert.
		expect( screen.getByText( 'The number is: 1' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Children' ) ).not.toBeInTheDocument();
	} );

	it( 'should replace the component based on the first matching condition with multiple conditions', () => {
		// Arrange.
		const { inject, Slot } = createReplaceableLocation< { text: string; number: number } >();

		// Act.
		inject( {
			id: 'test-1',
			component: ( { text, number } ) => (
				<div>
					First component: { text }: { number }
				</div>
			),
			condition: () => false,
		} );

		inject( {
			id: 'test-2',
			component: ( { text, number } ) => (
				<div>
					Second component: { text }: { number }
				</div>
			),
			condition: () => true,
		} );

		inject( {
			id: 'test-3',
			component: ( { text, number } ) => (
				<div>
					Third component: { text }: { number }
				</div>
			),
			condition: () => false,
		} );

		inject( {
			id: 'test-4',
			component: ( { text, number } ) => (
				<div>
					Fourth component: { text }: { number }
				</div>
			),
			condition: () => true,
		} );

		render(
			<Slot text="The number is" number={ 1 }>
				<div>Children</div>
			</Slot>
		);

		// Assert.
		expect( screen.queryByText( 'First component: The number is: 1' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Second component: The number is: 1' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Third component: The number is: 1' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Fourth component: The number is: 1' ) ).not.toBeInTheDocument();

		expect( screen.queryByText( 'Children' ) ).not.toBeInTheDocument();
	} );

	it( 'should render the replaceable when no condition is met', () => {
		// Arrange.
		const { inject, Slot } = createReplaceableLocation< { text: string; number: number } >();

		// Act.
		inject( {
			id: 'test-1',
			component: ( { text, number } ) => (
				<div>
					{ text }: { number }
				</div>
			),
			condition: ( { number } ) => number > 0,
		} );

		render(
			<Slot text="The number is" number={ -1 }>
				<div>Children</div>
			</Slot>
		);

		// Assert.
		expect( screen.queryByText( 'The number is: -1' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Children' ) ).toBeInTheDocument();
	} );

	it( 'should replace the component if the condition is empty', () => {
		// Arrange.
		const { inject, Slot } = createReplaceableLocation< { text: string; number: number } >();

		// Act.
		inject( {
			id: 'test-1',
			component: ( { text, number } ) => (
				<div>
					{ text }: { number }
				</div>
			),
		} );

		render(
			<Slot text="The number is" number={ 1 }>
				<div>Children</div>
			</Slot>
		);

		// Assert.
		expect( screen.getByText( 'The number is: 1' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Children' ) ).not.toBeInTheDocument();
	} );
} );
