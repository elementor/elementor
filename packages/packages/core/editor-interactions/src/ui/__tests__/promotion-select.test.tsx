import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { PromotionSelect } from '../promotion-select';

jest.mock( '@elementor/editor-controls', () => ( {
	...jest.requireActual( '@elementor/editor-controls' ),
	trackViewPromotion: jest.fn(),
	trackUpgradePromotionClick: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

const TRACKING_DATA = { target_name: 'interactions_trigger', location_l2: 'interactions' } as const;

const defaultProps = {
	value: 'load',
	onChange: jest.fn(),
	baseOptions: { load: 'Page load', scrollIn: 'Scroll into view' },
	disabledOptions: { hover: 'On hover', click: 'On click' },
	promotionLabel: 'PRO triggers',
	promotionContent: 'Upgrade triggers',
	upgradeUrl: 'https://example.com/upgrade',
	trackingData: TRACKING_DATA,
};

describe( 'PromotionSelect', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( callback: FrameRequestCallback ) => {
			callback( 0 );
			return 0;
		} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'opens promotion popover when a locked option is clicked', () => {
		renderWithTheme( <PromotionSelect { ...defaultProps } /> );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );

		fireEvent.mouseDown( screen.getByRole( 'option', { name: /On hover, Pro/i, hidden: true } ) );

		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( trackViewPromotion ).toHaveBeenCalledWith( {
			...TRACKING_DATA,
			target_value: 'hover',
		} );
	} );

	it( 'does not apply a locked option value', () => {
		const onChange = jest.fn();
		renderWithTheme( <PromotionSelect { ...defaultProps } onChange={ onChange } /> );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );
		fireEvent.mouseDown( screen.getByRole( 'option', { name: /On hover, Pro/i, hidden: true } ) );

		expect( onChange ).not.toHaveBeenCalled();
	} );

	it( 'opens promotion popover when a locked option is activated from the keyboard', () => {
		renderWithTheme( <PromotionSelect { ...defaultProps } /> );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );

		const lockedOption = screen.getByRole( 'option', { name: /On click, Pro/i, hidden: true } );
		fireEvent.keyDown( lockedOption, { key: 'Enter' } );

		expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		expect( trackViewPromotion ).toHaveBeenCalledWith( {
			...TRACKING_DATA,
			target_value: 'click',
		} );
	} );

	it( 'passes target_value through to upgrade click tracking', () => {
		renderWithTheme( <PromotionSelect { ...defaultProps } /> );

		fireEvent.mouseDown( screen.getByRole( 'combobox' ) );
		fireEvent.mouseDown( screen.getByRole( 'option', { name: /On hover, Pro/i, hidden: true } ) );

		fireEvent.click( screen.getByRole( 'link', { name: /Upgrade now/i } ) );

		expect( trackUpgradePromotionClick ).toHaveBeenCalledWith( {
			...TRACKING_DATA,
			target_value: 'hover',
		} );
	} );
} );
