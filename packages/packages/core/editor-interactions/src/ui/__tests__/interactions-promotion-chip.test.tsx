import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { InteractionsPromotionChip } from '../interactions-promotion-chip';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	trackViewPromotion: jest.fn(),
	trackUpgradePromotionClick: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

const TRACKING_DATA = { target_name: 'interactions', location_l2: 'interactions' } as const;

const defaultProps = {
	content: 'Unlock advanced interactions',
	upgradeUrl: 'https://example.com/upgrade',
	trackingData: TRACKING_DATA,
};

describe( 'InteractionsPromotionChip', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render promotion chip', () => {
		// Act.
		renderWithTheme( <InteractionsPromotionChip { ...defaultProps } /> );

		// Assert.
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
	} );

	it( 'should call trackViewPromotion when chip is clicked to open', () => {
		// Arrange.
		renderWithTheme( <InteractionsPromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );

		// Act.
		fireEvent.click( chip );

		// Assert.
		expect( trackViewPromotion ).toHaveBeenCalledWith( TRACKING_DATA );
	} );

	it( 'should not call trackViewPromotion when chip is clicked to close', () => {
		// Arrange.
		renderWithTheme( <InteractionsPromotionChip { ...defaultProps } /> );
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
		renderWithTheme( <InteractionsPromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );

		// Act.
		fireEvent.click( chip );

		// Assert.
		expect( screen.getByText( defaultProps.content ) ).toBeInTheDocument();
		expect( screen.getByText( 'Upgrade now' ) ).toBeInTheDocument();
	} );

	it( 'should call trackUpgradePromotionClick when CTA is clicked', () => {
		// Arrange.
		renderWithTheme( <InteractionsPromotionChip { ...defaultProps } /> );
		const chip = screen.getByLabelText( 'Promotion chip' );
		fireEvent.click( chip );

		// Act.
		const ctaButton = screen.getByRole( 'link', { name: /Upgrade now/i } );
		fireEvent.click( ctaButton );

		// Assert.
		expect( trackUpgradePromotionClick ).toHaveBeenCalledWith( TRACKING_DATA );
	} );
} );
