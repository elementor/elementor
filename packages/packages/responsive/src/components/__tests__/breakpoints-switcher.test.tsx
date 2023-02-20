import { Breakpoint } from '../../types';
import { render } from '@testing-library/react';
import useBreakpoints from '../../hooks/use-breakpoints';
import BreakpointsSwitcher from '../breakpoints-switcher';

jest.mock( '../../hooks/use-breakpoints', () => jest.fn() );

describe( '@elementor/responsive - Breakpoints Switcher', () => {
	it( 'should not render when there are no breakpoints', () => {
		// Arrange.
		jest.mocked( useBreakpoints ).mockReturnValue( {
			all: [],
			activate: jest.fn(),
			active: {
				id: 'desktop',
			},
		} );

		// Act.
		const { container } = render( <BreakpointsSwitcher /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should not render when there is no active breakpoint', () => {
		// Arrange.
		jest.mocked( useBreakpoints ).mockReturnValue( {
			active: null,
			activate: jest.fn(),
			all: [ {
				id: 'desktop',
			} ],
		} );

		// Act.
		const { container } = render( <BreakpointsSwitcher /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render all of the breakpoints', () => {
		// Arrange.
		const sortedBreakpoints: Breakpoint[] = [
			{ id: 'widescreen', width: 2400, type: 'min-width' },
			{ id: 'desktop' },
			{ id: 'laptop', width: 1366, type: 'max-width' },
			{ id: 'tablet_extra', width: 1200, type: 'max-width' },
			{ id: 'tablet', width: 1024, type: 'max-width' },
			{ id: 'mobile_extra', width: 880, type: 'max-width' },
			{ id: 'mobile', width: 767, type: 'max-width' },
		];

		jest.mocked( useBreakpoints ).mockReturnValue( {
			activate: jest.fn(),
			all: sortedBreakpoints,
			active: { id: 'desktop' },
		} );

		// Act.
		const { getAllByRole } = render( <BreakpointsSwitcher /> );

		// Assert.
		const tabs = getAllByRole( 'tab' );
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

		jest.mocked( useBreakpoints ).mockReturnValue( {
			activate,
			active: {
				id: 'desktop',
			},
			all: [
				{ id: 'mobile' },
				{ id: 'desktop' },
			],
		} );

		// Act.
		const { getByLabelText } = render( <BreakpointsSwitcher /> );
		const mobileTab = getByLabelText( 'Mobile Portrait', {
			selector: 'button',
		} );

		mobileTab.click();

		// Assert.
		expect( activate ).toHaveBeenCalledWith( 'mobile' );
	} );
} );
