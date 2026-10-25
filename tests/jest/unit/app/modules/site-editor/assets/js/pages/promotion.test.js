import React from 'react';
import { render, screen } from '@testing-library/react';
import Promotion from 'elementor/app/modules/site-editor/assets/js/pages/promotion';

jest.mock( 'elementor/app/modules/site-editor/assets/js/pages/promotion.scss', () => ( {} ) );
jest.mock( 'elementor-app/ui/card/card-overlay', () => ( { children } ) => <div>{ children }</div> );

jest.mock( 'elementor-app/ui/molecules/button', () => ( props ) => (
	<a href={ props.url } data-testid="header-upgrade-button">{ props.text }</a>
) );

jest.mock( 'elementor/app/modules/site-editor/assets/js/templates/layout', () => ( { children } ) => <div>{ children }</div> );
jest.mock( 'elementor/app/modules/site-editor/assets/js/organisms/all-parts-button', () => () => null );
jest.mock( 'elementor/app/modules/site-editor/assets/js/organisms/site-parts', () => () => null );
jest.mock( 'elementor-app/ui/grid/grid', () => {
	const Grid = ( { children } ) => <div>{ children }</div>;
	return Grid;
} );
jest.mock( 'elementor-app/ui/atoms/heading', () => ( { children } ) => <h1>{ children }</h1> );
jest.mock( 'elementor-app/ui/atoms/text', () => ( { children } ) => <p>{ children }</p> );

global.__ = jest.fn( ( text ) => text );
global.PropTypes = {
	string: () => null,
};

const DEFAULT_URL = 'https://go.elementor.com/go-pro-theme-builder/';

describe( 'Theme Builder promotion page', () => {
	beforeEach( () => {
		global.elementorAppConfig = {
			promotion: {},
		};
	} );

	it( 'uses CDN header button text and URL when provided', () => {
		global.elementorAppConfig.promotion = {
			upgrade_url: 'https://go.elementor.com/campaign/?a=1&b=2',
			button_text: 'Sale — Upgrade',
		};

		render( <Promotion /> );

		const button = screen.getByTestId( 'header-upgrade-button' );
		expect( button.getAttribute( 'href' ) ).toBe( 'https://go.elementor.com/campaign/?a=1&b=2' );
		expect( button.textContent ).toBe( 'Sale — Upgrade' );
	} );

	it( 'falls back to default header URL and translated label', () => {
		render( <Promotion /> );

		const button = screen.getByTestId( 'header-upgrade-button' );
		expect( button.getAttribute( 'href' ) ).toBe( DEFAULT_URL );
		expect( button.textContent ).toBe( 'Upgrade Now' );
	} );
} );
