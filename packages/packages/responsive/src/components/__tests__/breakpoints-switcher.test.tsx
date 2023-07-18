import { Breakpoint } from '../../types';
import { render } from '@testing-library/react';
import useBreakpoints from '../../hooks/use-breakpoints';
import BreakpointsSwitcher from '../breakpoints-switcher';
import useBreakpointsActions from '../../hooks/use-breakpoints-actions';

jest.mock( '../../hooks/use-breakpoints', () => jest.fn() );
jest.mock( '../../hooks/use-breakpoints-actions', () => jest.fn().mockReturnValue( {
	activate: jest.fn(),
} ) );

describe( '@elementor/responsive - Breakpoints Switcher', () => {
	it( 'should not render when there are no breakpoints', () => {
		// Arrange.
		jest.mocked( useBreakpoints ).mockReturnValue( {
			all: [],
			active: {
				id: 'desktop',
				label: 'Desktop',
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
			all: [ {
				id: 'desktop',
				label: 'Desktop',
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
			{ id: 'widescreen', label: 'Widescreen', width: 2400, type: 'min-width' },
			{ id: 'desktop', label: 'Desktop' },
			{ id: 'laptop', label: 'Laptop', width: 1366, type: 'max-width' },
			{ id: 'tablet_extra', label: 'Tablet Landscape', width: 1200, type: 'max-width' },
			{ id: 'tablet', label: 'Tablet Portrait', width: 1024, type: 'max-width' },
			{ id: 'mobile_extra', label: 'Mobile Landscape', width: 880, type: 'max-width' },
			{ id: 'mobile', label: 'Mobile Portrait', width: 767, type: 'max-width' },
		];

		jest.mocked( useBreakpoints ).mockReturnValue( {
			all: sortedBreakpoints,
			active: { id: 'desktop', label: 'Desktop' },
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

		jest.mocked( useBreakpointsActions ).mockReturnValue( {
			activate,
		} );

		jest.mocked( useBreakpoints ).mockReturnValue( {
			active: {
				id: 'desktop',
				label: 'Desktop',
			},
			all: [
				{ id: 'mobile', label: 'Mobile Portrait' },
				{ id: 'desktop', label: 'Desktop' },
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
