import * as React from 'react';
import { useBreakpoints } from '@elementor/editor-responsive';
import { fireEvent, render, screen } from '@testing-library/react';

import { InteractionSettings } from '../components/interaction-settings';
import { extractExcludedBreakpoints } from '../utils/prop-value-utils';
import { createInteractionItemValue } from './utils';

jest.mock( '@elementor/editor-responsive', () => ( {
	useBreakpoints: jest.fn(),
} ) );

describe( 'InteractionSettings', () => {
	const mockOnChange = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useBreakpoints ).mockReturnValue( [
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'tablet', label: 'Tablet' },
			{ id: 'mobile', label: 'Mobile' },
		] );
	} );

	describe( 'Rendering', () => {
		it( 'should render with no excluded breakpoints', () => {
			const interaction = createInteractionItemValue();

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Trigger on' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'combobox' ) ).toBeInTheDocument();
		} );

		it( 'should render with all breakpoints selected when none excluded', () => {
			const interaction = createInteractionItemValue();

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Desktop' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Tablet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Mobile' ) ).toBeInTheDocument();
		} );

		it( 'should render with some breakpoints excluded', () => {
			const interaction = createInteractionItemValue( { excludedBreakpoints: [ 'desktop' ] } );

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.queryByText( 'Desktop' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Tablet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Mobile' ) ).toBeInTheDocument();
		} );

		it( 'should render with multiple breakpoints excluded', () => {
			const interaction = createInteractionItemValue( { excludedBreakpoints: [ 'desktop', 'tablet' ] } );

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.queryByText( 'Desktop' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Tablet' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Mobile' ) ).toBeInTheDocument();
		} );

		it( 'should render with excluded breakpoints, that are not present in the list of available', () => {
			const interaction = createInteractionItemValue( {
				excludedBreakpoints: [ 'desktop', 'tablet-non-existing' ],
			} );

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.queryByText( 'Desktop' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Tablet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Mobile' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'onChange callback', () => {
		it( 'should call onChange when adding excluded breakpoint via dropdown', () => {
			const interaction = createInteractionItemValue();

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			const combobox = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( combobox );

			const desktopOption = screen.getByRole( 'option', { name: /desktop/i } );
			fireEvent.click( desktopOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];
			expect( updatedInteraction.breakpoints ).toBeDefined();

			const excluded = extractExcludedBreakpoints( updatedInteraction.breakpoints );
			expect( excluded ).toEqual( [ 'desktop' ] );
		} );

		it( 'should call onChange with correct structure when excluding breakpoints', () => {
			const interaction = createInteractionItemValue();

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			const combobox = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( combobox );

			const tabletOption = screen.getByRole( 'option', { name: /tablet/i } );
			fireEvent.click( tabletOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];

			expect( updatedInteraction.breakpoints?.$$type ).toBe( 'interaction-breakpoints' );
			expect( updatedInteraction.breakpoints?.value.excluded.$$type ).toBe( 'excluded-breakpoints' );

			const excluded = extractExcludedBreakpoints( updatedInteraction.breakpoints );
			expect( excluded.length ).toBeGreaterThan( 0 );
		} );

		it( 'should remove breakpoints property when all breakpoints are selected', () => {
			const interaction = createInteractionItemValue( { excludedBreakpoints: [ 'desktop' ] } );

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			const combobox = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( combobox );

			const desktopOption = screen.getByRole( 'option', { name: /desktop/i } );
			fireEvent.click( desktopOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];

			expect( updatedInteraction.breakpoints ).toBeUndefined();
		} );

		it( 'should preserve other interaction data when breakpoints change', () => {
			const interaction = createInteractionItemValue();

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			const combobox = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( combobox );

			const mobileOption = screen.getByRole( 'option', { name: /mobile/i } );
			fireEvent.click( mobileOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];

			expect( updatedInteraction.interaction_id?.value ).toBe( 'test-id' );
			expect( updatedInteraction.trigger.value ).toBe( 'load' );
			expect( updatedInteraction.animation.value.effect.value ).toBe( 'fade' );
			expect( updatedInteraction.animation.value.type.value ).toBe( 'in' );
		} );
	} );

	describe( 'Edge cases', () => {
		it( 'should handle interaction with undefined breakpoints', () => {
			const interaction = createInteractionItemValue();
			interaction.breakpoints = undefined;

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			expect( screen.getByText( 'Trigger on' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'combobox' ) ).toBeInTheDocument();
		} );

		it( 'should handle interaction with all breakpoints excluded', () => {
			const interaction = createInteractionItemValue( {
				excludedBreakpoints: [ 'desktop', 'tablet', 'mobile' ],
			} );

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			const combobox = screen.getByRole( 'combobox' );
			expect( combobox ).toBeInTheDocument();
		} );

		it( 'should handle adding breakpoint back after exclusion', () => {
			const interaction = createInteractionItemValue( { excludedBreakpoints: [ 'desktop', 'tablet' ] } );

			render( <InteractionSettings interaction={ interaction } onChange={ mockOnChange } /> );

			const combobox = screen.getByRole( 'combobox' );
			fireEvent.mouseDown( combobox );

			const desktopOption = screen.getByRole( 'option', { name: /desktop/i } );
			fireEvent.click( desktopOption );

			expect( mockOnChange ).toHaveBeenCalledTimes( 1 );
			const updatedInteraction = mockOnChange.mock.calls[ 0 ][ 0 ];

			const excluded = extractExcludedBreakpoints( updatedInteraction.breakpoints );
			expect( excluded ).toEqual( [ 'tablet' ] );
		} );
	} );
} );
