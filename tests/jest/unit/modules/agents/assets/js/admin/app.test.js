/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { App } from 'elementor/modules/agents/assets/js/admin/app';
import { ModulesStatus } from 'elementor/modules/agents/assets/js/admin/components/modules-status';
import { WelcomeScreen } from 'elementor/modules/agents/assets/js/admin/components/welcome-screen';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( /%[sd]/, arg ), format ),
} ) );

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	activateAgentsReady: jest.fn(),
	fetchLlmsFile: jest.fn( () => new Promise( () => {} ) ),
	saveAgentReadySettings: jest.fn( () => Promise.resolve() ),
	saveLlmsContent: jest.fn( () => Promise.resolve() ),
	searchMarkdownItems: jest.fn( () => Promise.resolve( [] ) ),
} ) );

jest.mock( '@elementor/icons', () => ( {
	AlertCircleIcon: () => <span data-testid="alert-circle-icon" />,
	ArchiveTemplateIcon: () => <span />,
	ArrowsDiagonalIcon: () => <span />,
	CircleCheckFilledIcon: () => <span data-testid="circle-check-icon" />,
	CircleXFilledIcon: () => <span data-testid="circle-x-icon" />,
	FileIcon: () => <span />,
	InfoCircleIcon: () => <span data-testid="info-icon" />,
	ChevronDownIcon: () => <span data-testid="chevron-down-icon" />,
	ChevronUpIcon: () => <span data-testid="chevron-up-icon" />,
	PencilIcon: () => <span />,
	PinIcon: () => <span />,
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
jest.mock( '@elementor/ui/Collapse', () => ( { children, in: isOpen } ) => ( isOpen ? <div>{ children }</div> : null ) );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/IconButton', () => ( { children, onClick } ) => (
	<button type="button" onClick={ onClick }>{ children }</button>
) );
jest.mock( '@elementor/ui/Infotip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Tooltip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Switch', () => ( { checked, disabled, onChange, onClick } ) => (
	<input type="checkbox" role="switch" checked={ checked } disabled={ disabled } onChange={ onChange } onClick={ onClick } />
) );
jest.mock( '@elementor/ui/SvgIcon', () => ( { children } ) => <svg>{ children }</svg> );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );
jest.mock( '@elementor/ui', () => ( {
	DirectionProvider: ( { children } ) => <div>{ children }</div>,
	LocalizationProvider: ( { children } ) => <div>{ children }</div>,
	ThemeProvider: ( { children, palette } ) => <div data-testid="theme-provider" data-palette={ palette }>{ children }</div>,
} ) );

import { activateAgentsReady, saveAgentReadySettings } from 'elementor/modules/agents/assets/js/admin/api';

const llmsConfig = {
	enabled: true,
	isManuallyEdited: false,
	hasPhysicalFile: false,
	fileUrl: 'https://example.com/llms.txt',
	postTypes: [ { name: 'page', label: 'Pages', count: 2, included: true } ],
};

const markdownConfig = {
	enabled: true,
	postTypes: [ { name: 'page', label: 'Pages', count: 2, included: true } ],
};

const botAccessConfig = {
	enabled: true,
	hasPhysicalFile: false,
	bots: [ { token: 'GPTBot', search: true, aiInput: true, aiTrain: false } ],
	catalog: [ { token: 'GPTBot', name: 'GPTBot', vendor: 'OpenAI', logoUrl: '' } ],
};

const agentDiscoveryConfig = {
	enabled: true,
	files: [ { slug: 'agent.json', url: 'https://example.com/.well-known/agent.json' } ],
};

const BOT_ACCESS_SWITCH_INDEX = 3;
const AGENT_DISCOVERY_SWITCH_INDEX = 4;

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

	it( 'renders the four module accordions when the experiment is active', () => {
		// Arrange & Act
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Assert
		expect( screen.getByText( 'LLMs.txt' ) ).toBeTruthy();
		expect( screen.getByText( 'Markdown content' ) ).toBeTruthy();
		expect( screen.getByText( 'Bot access control' ) ).toBeTruthy();
		expect( screen.getByText( 'Agent discovery' ) ).toBeTruthy();
		expect( screen.getByText( '4/4' ) ).toBeTruthy();
		expect( screen.queryByRole( 'tab' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Activate' } ) ).toBeNull();
	} );

	it( 'updates the active count and persists the setting when LLMs.txt is toggled off', async () => {
		// Arrange
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'switch' )[ 0 ] );

		// Assert
		expect( screen.getByText( '3/4' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			llms_txt: { enabled: false, post_types: [ 'page' ] },
		} );
		await waitFor( () => {
			expect( screen.getAllByRole( 'switch' )[ 0 ].disabled ).toBe( false );
		} );
	} );

	it( 'rolls back the LLMs.txt toggle and shows an alert when saving fails', async () => {
		// Arrange
		saveAgentReadySettings.mockRejectedValueOnce( null );
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'switch' )[ 0 ] );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Something went wrong. Please try again.' ) ).toBeTruthy();
			expect( screen.getAllByRole( 'switch' )[ 0 ].disabled ).toBe( false );
		} );
		expect( screen.getByText( '4/4' ) ).toBeTruthy();
	} );

	it( 'disables the LLMs.txt switch while settings are saving', async () => {
		// Arrange
		let resolveSave;
		saveAgentReadySettings.mockImplementationOnce( () => new Promise( ( resolve ) => {
			resolveSave = resolve;
		} ) );
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'switch' )[ 0 ] );

		// Assert
		expect( screen.getAllByRole( 'switch' )[ 0 ].disabled ).toBe( true );

		resolveSave();

		await waitFor( () => {
			expect( screen.getAllByRole( 'switch' )[ 0 ].disabled ).toBe( false );
		} );
	} );

	it( 'locks the LLMs.txt switch off when a physical file exists', () => {
		// Arrange & Act
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ { ...llmsConfig, hasPhysicalFile: true } } markdownConfig={ markdownConfig } /> );

		// Assert
		const [ llmsSwitch ] = screen.getAllByRole( 'switch' );
		expect( llmsSwitch.checked ).toBe( false );
		expect( llmsSwitch.disabled ).toBe( true );
		expect( screen.getByText( '3/4' ) ).toBeTruthy();
	} );

	it( 'persists the bot access setting when its module is toggled off', async () => {
		// Arrange
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'switch' )[ BOT_ACCESS_SWITCH_INDEX ] );

		// Assert
		expect( screen.getByText( '3/4' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			bot_access_control: {
				enabled: false,
				bots: { GPTBot: { search: true, ai_input: true, ai_train: false } },
			},
		} );
		await waitFor( () => {
			expect( screen.getAllByRole( 'switch' )[ BOT_ACCESS_SWITCH_INDEX ].disabled ).toBe( false );
		} );
	} );

	it( 'persists the agent discovery setting when its module is toggled off', async () => {
		// Arrange
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Act
		fireEvent.click( screen.getAllByRole( 'switch' )[ AGENT_DISCOVERY_SWITCH_INDEX ] );

		// Assert
		expect( screen.getByText( '3/4' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			agent_discovery: { enabled: false },
		} );
		await waitFor( () => {
			expect( screen.getAllByRole( 'switch' )[ AGENT_DISCOVERY_SWITCH_INDEX ].disabled ).toBe( false );
		} );
	} );

	it( 'locks the bot access switch off when a physical robots.txt exists', () => {
		// Arrange & Act
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ { ...botAccessConfig, hasPhysicalFile: true } } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Assert
		const botAccessSwitch = screen.getAllByRole( 'switch' )[ BOT_ACCESS_SWITCH_INDEX ];
		expect( botAccessSwitch.checked ).toBe( false );
		expect( botAccessSwitch.disabled ).toBe( true );
		expect( screen.getByText( '3/4' ) ).toBeTruthy();
	} );

	it( 'opens the first module by default and restores its description when collapsed', () => {
		// Arrange
		render( <App isExperimentActive={ true } agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> );

		// Assert - the first module starts open; the rest stay collapsed
		expect( screen.queryByText( 'Guide AI agents through your site' ) ).toBeNull();
		expect( screen.getByText( 'Help agents find your content' ) ).toBeTruthy();
		expect( screen.getByText( 'Make your content easier to read' ) ).toBeTruthy();
		expect( screen.getByText( 'Control how agents use your content' ) ).toBeTruthy();
		expect( screen.getByText( 'Tell agents what this site offers them' ) ).toBeTruthy();

		// Act
		fireEvent.click( screen.getByText( 'LLMs.txt' ) );

		// Assert
		expect( screen.getByText( 'Guide AI agents through your site' ) ).toBeTruthy();
		expect( screen.queryByText( 'Help agents find your content' ) ).toBeNull();
		expect( screen.getByText( 'Make your content easier to read' ) ).toBeTruthy();
		expect( screen.getByText( 'Control how agents use your content' ) ).toBeTruthy();
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
