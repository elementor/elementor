import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import {
	type Breakpoint,
	useActivateBreakpoint,
	useActiveBreakpoint,
	useBreakpoints,
} from '@elementor/editor-responsive';
import { fireEvent, screen } from '@testing-library/react';

import BreakpointsSwitcher from '../breakpoints-switcher';

jest.mock( '@elementor/editor-responsive' );

describe( '<BreakpointsSwitcher />', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should not render when there are no breakpoints', () => {
		// Arrange.
		jest.mocked( useBreakpoints ).mockReturnValue( [] );
		jest.mocked( useActiveBreakpoint ).mockReturnValue( 'desktop' );

		// Act.
		const { container } = renderWithTheme( <BreakpointsSwitcher /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when there is no active breakpoint', () => {
		// Arrange.
		jest.mocked( useBreakpoints ).mockReturnValue( [ { id: 'desktop', label: 'Desktop' } ] );
		jest.mocked( useActiveBreakpoint ).mockReturnValue( null );

		// Act.
		const { container } = renderWithTheme( <BreakpointsSwitcher /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render all of the breakpoints', () => {
		// Arrange.
		const sortedBreakpoints: Breakpoint[] = [
			{ id: 'widescreen', label: 'Widescreen', width: 2400, type: 'min-width' },
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'laptop', label: 'Laptop', width: 1366, type: 'max-width' },
			{ id: 'tablet_extra', label: 'Tablet Landscape', width: 1200, type: 'max-width' },
			{ id: 'tablet', label: 'Tablet Portrait', width: 1024, type: 'max-width' },
			{ id: 'mobile_extra', label: 'Mobile Landscape', width: 880, type: 'max-width' },
			{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
		];

		jest.mocked( useBreakpoints ).mockReturnValue( sortedBreakpoints );
		jest.mocked( useActiveBreakpoint ).mockReturnValue( 'desktop' );

		// Act.
		renderWithTheme( <BreakpointsSwitcher /> );

		// Assert.
		const tabs = screen.getAllByRole( 'tab' );
		const expectedLabels = [
			'Widescreen (2400px and up)',
			'Desktop',
			'Laptop (up to 1366px)',
			'Tablet Landscape (up to 1200px)',
			'Tablet Portrait (up to 1024px)',
			'Mobile Landscape (up to 880px)',
			'Mobile Portrait (up to 767px)',
		];

		expect( tabs ).toHaveLength( 7 );

		tabs.forEach( ( tab, index ) => {
			expect( tab ).toHaveAttribute( 'aria-label', expectedLabels[ index ] );
		} );

		// Desktop should be active.
		expect( tabs[ 1 ] ).toHaveAttribute( 'aria-selected', 'true' );
	} );

	it( 'should activate a breakpoint on click', () => {
		// Arrange.
		const activate = jest.fn();

		jest.mocked( useActivateBreakpoint ).mockReturnValue( activate );
		jest.mocked( useActiveBreakpoint ).mockReturnValue( 'desktop' );

		jest.mocked( useBreakpoints ).mockReturnValue( [
			{ id: 'mobile', label: 'Mobile Portrait' },
			{ id: 'desktop', label: 'Desktop' },
		] );

		// Act.
		renderWithTheme( <BreakpointsSwitcher /> );

		const mobileTab = screen.getByLabelText( 'Mobile Portrait', {
			selector: 'button',
		} );

		fireEvent.click( mobileTab );

		// Assert.
		expect( activate ).toHaveBeenCalledWith( 'mobile' );
	} );
} );
