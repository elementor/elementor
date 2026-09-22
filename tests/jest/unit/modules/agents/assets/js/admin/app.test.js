/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from 'elementor/modules/agents/assets/js/admin/app';
import { WelcomeScreen } from 'elementor/modules/agents/assets/js/admin/components/welcome-screen';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	activateAgentsReady: jest.fn(),
} ) );

jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, onClick, loading } ) => (
	<button type="button" onClick={ onClick } disabled={ loading }>{ children }</button>
) );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );
jest.mock( '@elementor/ui/SvgIcon', () => ( { children } ) => <svg>{ children }</svg> );
jest.mock( '@elementor/ui/Tab', () => ( { label } ) => <button type="button" role="tab">{ label }</button> );
jest.mock( '@elementor/ui/Tabs', () => ( { children } ) => <div role="tablist">{ children }</div> );
jest.mock( '@elementor/ui/TabPanel', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui', () => ( {
	DirectionProvider: ( { children } ) => <div>{ children }</div>,
	LocalizationProvider: ( { children } ) => <div>{ children }</div>,
	ThemeProvider: ( { children } ) => <div>{ children }</div>,
	useTabs: () => ( {
		getTabsProps: () => ( {
			value: 'overview',
			onChange: jest.fn(),
		} ),
		getTabProps: ( value ) => ( { value } ),
		getTabPanelProps: () => ( {} ),
	} ),
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
		expect( screen.queryByRole( 'tab', { name: 'Overview' } ) ).toBeNull();
	} );

	it( 'renders Overview and Tab 2 when the experiment is active', () => {
		// Arrange & Act
		render( <App isExperimentActive={ true } /> );

		// Assert
		expect( screen.getByRole( 'tab', { name: 'Overview' } ) ).toBeTruthy();
		expect( screen.getByRole( 'tab', { name: 'Tab 2' } ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Activate' } ) ).toBeNull();
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
