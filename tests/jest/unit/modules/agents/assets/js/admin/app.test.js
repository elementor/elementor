/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from 'elementor/modules/agents/assets/js/admin/app';
import { ModulesStatus } from 'elementor/modules/agents/assets/js/admin/components/modules-status';
import { WelcomeScreen } from 'elementor/modules/agents/assets/js/admin/components/welcome-screen';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	activateAgentsReady: jest.fn(),
} ) );

jest.mock( '@elementor/icons', () => ( {
	AlertCircleIcon: () => <span data-testid="alert-circle-icon" />,
	CircleCheckFilledIcon: () => <span data-testid="circle-check-icon" />,
	CircleXFilledIcon: () => <span data-testid="circle-x-icon" />,
	InfoCircleIcon: () => <span data-testid="info-icon" />,
	ChevronDownIcon: () => <span data-testid="chevron-down-icon" />,
	ChevronUpIcon: () => <span data-testid="chevron-up-icon" />,
} ) );

jest.mock( '@elementor/ui/Accordion', () => ( { children, expanded, onChange } ) => (
	<div onClick={ ( event ) => onChange( event, ! expanded ) }>{ children }</div>
) );
jest.mock( '@elementor/ui/AccordionDetails', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/AccordionSummary', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, onClick, loading } ) => (
	<button type="button" onClick={ onClick } disabled={ loading }>{ children }</button>
) );
jest.mock( '@elementor/ui/Chip', () => ( { label } ) => <span data-testid="chip">{ label }</span> );
jest.mock( '@elementor/ui/Infotip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Switch', () => ( { checked, onChange, onClick } ) => (
	<input type="checkbox" role="switch" checked={ checked } onChange={ onChange } onClick={ onClick } />
) );
jest.mock( '@elementor/ui/SvgIcon', () => ( { children } ) => <svg>{ children }</svg> );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );
jest.mock( '@elementor/ui', () => ( {
	DirectionProvider: ( { children } ) => <div>{ children }</div>,
	LocalizationProvider: ( { children } ) => <div>{ children }</div>,
	ThemeProvider: ( { children, palette } ) => <div data-testid="theme-provider" data-palette={ palette }>{ children }</div>,
} ) );

import { activateAgentsReady } from 'elementor/modules/agents/assets/js/admin/api';

describe( 'Agents Ready App', () => {
	beforeEach( () => {
		activateAgentsReady.mockReset();
	} );

	it( 'renders the welcome activate action when the experiment is inactive', () => {
		// Arrange & Act
		render( <App isExperimentActive={ false } /> );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Activate' } ) ).toBeTruthy();
		expect( screen.queryByText( 'LLMs.txt' ) ).toBeNull();
	} );

	it( 'uses the Argon theme palette', () => {
		// Arrange & Act
		render( <App isExperimentActive={ false } /> );

		// Assert
		expect( screen.getByTestId( 'theme-provider' ).getAttribute( 'data-palette' ) ).toBe( 'argon-beta' );
	} );

	it( 'renders the three module accordions when the experiment is active', () => {
		// Arrange & Act
		render( <App isExperimentActive={ true } /> );

		// Assert
		expect( screen.getByText( 'LLMs.txt' ) ).toBeTruthy();
		expect( screen.getByText( 'Markdown content' ) ).toBeTruthy();
		expect( screen.getByText( 'Bot access control' ) ).toBeTruthy();
		expect( screen.getByText( '3/4' ) ).toBeTruthy();
		expect( screen.queryByRole( 'tab' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Activate' } ) ).toBeNull();
	} );

	it( 'updates the active count when a module is toggled off', () => {
		// Arrange
		render( <App isExperimentActive={ true } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'switch' )[ 0 ] );

		// Assert
		expect( screen.getByText( '2/4' ) ).toBeTruthy();
	} );

	it( 'moves the description from an inline chip to a body heading when a module is expanded', () => {
		// Arrange
		render( <App isExperimentActive={ true } /> );

		// Assert - all three modules start collapsed with an inline description chip
		expect( screen.getAllByTestId( 'chip' ) ).toHaveLength( 3 );
		expect( screen.getByText( 'Guide AI agents through your site' ) ).toBeTruthy();

		// Act
		fireEvent.click( screen.getByText( 'LLMs.txt' ) );

		// Assert - expanding removes that module's chip and shows the description as the body heading instead
		expect( screen.getAllByTestId( 'chip' ) ).toHaveLength( 2 );
		expect( screen.getByText( 'Guide AI agents through your site' ) ).toBeTruthy();
	} );

	it( 'keeps the welcome screen when activation fails', async () => {
		// Arrange
		activateAgentsReady.mockRejectedValue( new Error( 'fail' ) );
		render( <WelcomeScreen /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Activate' } ) );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Activation failed. Please try again.' ) ).toBeTruthy();
		} );
	} );
} );

describe( 'ModulesStatus', () => {
	it( 'shows the success icon when the score is full', () => {
		// Arrange & Act
		render( <ModulesStatus score={ 4 } /> );

		// Assert
		expect( screen.getByText( '4/4' ) ).toBeTruthy();
		expect( screen.getByTestId( 'circle-check-icon' ) ).toBeTruthy();
	} );

	it( 'shows the warning icon when the score is partial', () => {
		// Arrange & Act
		render( <ModulesStatus score={ 1 } /> );

		// Assert
		expect( screen.getByText( '1/4' ) ).toBeTruthy();
		expect( screen.getByTestId( 'alert-circle-icon' ) ).toBeTruthy();
	} );

	it( 'shows the error icon when the score is zero', () => {
		// Arrange & Act
		render( <ModulesStatus score={ 0 } /> );

		// Assert
		expect( screen.getByText( '0/4' ) ).toBeTruthy();
		expect( screen.getByTestId( 'circle-x-icon' ) ).toBeTruthy();
	} );
} );
