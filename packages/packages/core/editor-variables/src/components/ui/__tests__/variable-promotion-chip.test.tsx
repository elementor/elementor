import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { VariablePromotionChip } from '../variable-promotion-chip';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	trackViewPromotion: jest.fn(),
	trackUpgradePromotionClick: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
	sprintf: ( str: string, ...args: string[] ) => {
		let result = str;
		args.forEach( ( arg ) => {
			result = result.replace( '%s', arg );
		} );
		return result;
	},
} ) );

jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	capitalize: ( str: string ) => str.charAt( 0 ).toUpperCase() + str.slice( 1 ),
} ) );

const TRACKING_DATA = { target_name: 'variables_manager', target_location: 'variables_manager' } as const;

const defaultProps = {
	variableType: 'color',
	upgradeUrl: 'https://example.com/upgrade',
	trackingData: TRACKING_DATA,
};

describe( 'VariablePromotionChip', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render promotion chip', () => {
		// Act.
		renderWithTheme( <VariablePromotionChip { ...defaultProps } /> );

		// Assert.
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
	} );

	it( 'should call trackViewPromotion when chip is clicked to open', () => {
		// Arrange.
		renderWithTheme( <VariablePromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );

		// Act.
		fireEvent.click( chip );

		// Assert.
		expect( trackViewPromotion ).toHaveBeenCalledWith( TRACKING_DATA );
	} );

	it( 'should not call trackViewPromotion when chip is clicked to close', () => {
		// Arrange.
		renderWithTheme( <VariablePromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );

		// Act - open then close.
		fireEvent.click( chip );
		jest.mocked( trackViewPromotion ).mockClear();
		fireEvent.click( chip );

		// Assert.
		expect( trackViewPromotion ).not.toHaveBeenCalled();
	} );

	it( 'should show popover content when chip is clicked', () => {
		// Arrange.
		renderWithTheme( <VariablePromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );

		// Act.
		fireEvent.click( chip );

		// Assert.
		expect( screen.getByText( 'Color variables' ) ).toBeInTheDocument();
		expect( screen.getByText( /Upgrade to continue creating and editing color variables/ ) ).toBeInTheDocument();
		expect( screen.getByText( 'Upgrade now' ) ).toBeInTheDocument();
	} );

	it( 'should call trackUpgradePromotionClick when CTA is clicked', () => {
		// Arrange.
		renderWithTheme( <VariablePromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );
		fireEvent.click( chip );

		// Act.
		const ctaButton = screen.getByRole( 'link', { name: /Upgrade now/i } );
		fireEvent.click( ctaButton );

		// Assert.
		expect( trackUpgradePromotionClick ).toHaveBeenCalledWith( TRACKING_DATA );
	} );
} );
