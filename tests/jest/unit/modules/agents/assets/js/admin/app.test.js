/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

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
	AcademyIcon: () => <span />,
	AlertCircleIcon: () => <span data-testid="alert-circle-icon" />,
	ArchiveTemplateIcon: () => <span />,
	ArrowsDiagonalIcon: () => <span />,
	BanIcon: () => <span />,
	BriefcaseIcon: () => <span />,
	ChevronDownIcon: () => <span data-testid="chevron-down-icon" />,
	ChevronUpIcon: () => <span data-testid="chevron-up-icon" />,
	CircleCheckFilledIcon: () => <span data-testid="circle-check-icon" />,
	CircleCheckIcon: () => <span />,
	CircleXFilledIcon: () => <span data-testid="circle-x-icon" />,
	ContentIcon: () => <span />,
	FileIcon: () => <span />,
	FileTextIcon: () => <span />,
	InfoCircleIcon: () => <span data-testid="info-icon" />,
	PencilIcon: () => <span />,
	PinIcon: () => <span />,
	SearchIcon: () => <span />,
	SitemapIcon: () => <span />,
	ToolIcon: () => <span />,
	XIcon: () => <span />,
	ZoomIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Accordion', () => {
	const React = require( 'react' );

	return ( { children, expanded, onChange } ) => {
		const items = React.Children.toArray( children );

		return (
			<div onClick={ ( event ) => onChange( event, ! expanded ) }>
				{ items[ 0 ] }
				{ expanded ? items.slice( 1 ) : null }
			</div>
		);
	};
} );
jest.mock( '@elementor/ui/AccordionDetails', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/AccordionSummary', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Box', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Button', () => ( { children, onClick, loading, disabled } ) => (
	<button type="button" onClick={ onClick } disabled={ loading || disabled }>{ children }</button>
) );
jest.mock( '@elementor/ui/Chip', () => ( { label } ) => <span data-testid="chip">{ label }</span> );
jest.mock( '@elementor/ui/Collapse', () => ( { children, in: isOpen } ) => ( isOpen ? <div>{ children }</div> : null ) );
jest.mock( '@elementor/ui/Dialog', () => ( { children, open } ) => ( open ? <div role="dialog">{ children }</div> : null ) );
jest.mock( '@elementor/ui/DialogActions', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogContent', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/DialogContentText', () => ( { children } ) => <p>{ children }</p> );
jest.mock( '@elementor/ui/DialogTitle', () => ( { children } ) => <h2>{ children }</h2> );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/IconButton', () => ( { children, onClick } ) => (
	<button type="button" onClick={ onClick }>{ children }</button>
) );
jest.mock( '@elementor/ui/Infotip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Tooltip', () => ( { children } ) => children );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Switch', () => ( { checked, disabled, onChange, onClick, inputProps } ) => (
	<input type="checkbox" role="switch" checked={ checked } disabled={ disabled } onChange={ onChange } onClick={ onClick } aria-label={ inputProps?.[ 'aria-label' ] } />
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

const browserToolsConfig = {
	enabled: true,
	isAvailable: true,
	businessDetails: '',
	maxBusinessDetailsLength: 2000,
	tools: [
		{ name: 'search_site_content', label: 'Search site content', description: 'Let agents find relevant pages and posts easily.' },
		{ name: 'query_business_info', label: 'Get business information', description: 'Access business details.' },
	],
};

const BOT_ACCESS_SWITCH_INDEX = 3;
const AGENT_DISCOVERY_SWITCH_INDEX = 4;
const BROWSER_TOOLS_SWITCH_INDEX = 5;

const getModuleSwitch = ( index ) => screen.getAllByRole( 'switch' )[ index ];

const clickTurnOff = () => fireEvent.click( screen.getByRole( 'button', { name: 'Turn off' } ) );

const confirmTurnOff = () => fireEvent.click( within( screen.getByRole( 'dialog' ) ).getByRole( 'button', { name: 'Turn off' } ) );

const renderActiveApp = ( overrides = {} ) => render(
	<App
		isActivated
		agentDiscoveryConfig={ agentDiscoveryConfig }
		botAccessConfig={ botAccessConfig }
		llmsConfig={ llmsConfig }
		markdownConfig={ markdownConfig }
		browserToolsConfig={ browserToolsConfig }
		{ ...overrides }
	/>,
);

describe( 'Agents Ready App', () => {
	beforeEach( () => {
		activateAgentsReady.mockReset();
	} );

	it( 'renders the welcome activate action and no module toggles before activation', () => {
		// Arrange & Act
		render( <App isActivated={ false } /> );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Activate' } ) ).toBeTruthy();
		expect( screen.queryByText( 'LLMs.txt' ) ).toBeNull();
	} );

	it( 'uses the Argon theme palette', () => {
		// Arrange & Act
		renderActiveApp();

		// Assert
		expect( screen.getByTestId( 'theme-provider' ).getAttribute( 'data-palette' ) ).toBe( 'argon-beta' );
	} );

	it( 'renders the five module accordions', () => {
		// Arrange & Act
		renderActiveApp();

		// Assert
		expect( screen.getByText( 'LLMs.txt' ) ).toBeTruthy();
		expect( screen.getByText( 'Markdown content' ) ).toBeTruthy();
		expect( screen.getByText( 'Bot access control' ) ).toBeTruthy();
		expect( screen.getByText( 'Agent discovery' ) ).toBeTruthy();
		expect( screen.getByText( 'Agent browser tools' ) ).toBeTruthy();
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
		expect( screen.queryByRole( 'tab' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Activate' } ) ).toBeNull();
	} );

	it( 'updates the active count and persists the setting when LLMs.txt is toggled off', async () => {
		// Arrange
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Act
		fireEvent.click( getModuleSwitch( 0 ) );

		// Assert
		expect( screen.getByText( '4/5' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			llms_txt: { enabled: false, post_types: [ 'page' ] },
		} );
		await waitFor( () => {
			expect( getModuleSwitch( 0 ).disabled ).toBe( false );
		} );
	} );

	it( 'rolls back the LLMs.txt toggle and shows an alert when saving fails', async () => {
		// Arrange
		saveAgentReadySettings.mockRejectedValueOnce( null );
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Act
		fireEvent.click( getModuleSwitch( 0 ) );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Something went wrong. Please try again.' ) ).toBeTruthy();
			expect( getModuleSwitch( 0 ).disabled ).toBe( false );
		} );
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
	} );

	it( 'disables the LLMs.txt switch while settings are saving', async () => {
		// Arrange
		let resolveSave;
		saveAgentReadySettings.mockImplementationOnce( () => new Promise( ( resolve ) => {
			resolveSave = resolve;
		} ) );
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Act
		fireEvent.click( getModuleSwitch( 0 ) );

		// Assert
		expect( getModuleSwitch( 0 ).disabled ).toBe( true );

		resolveSave();

		await waitFor( () => {
			expect( getModuleSwitch( 0 ).disabled ).toBe( false );
		} );
	} );

	it( 'locks the LLMs.txt switch off when a physical file exists', () => {
		// Arrange & Act
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ { ...llmsConfig, hasPhysicalFile: true } } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Assert
		const llmsSwitch = getModuleSwitch( 0 );
		expect( llmsSwitch.checked ).toBe( false );
		expect( llmsSwitch.disabled ).toBe( true );
		expect( screen.getByText( '4/5' ) ).toBeTruthy();
	} );

	it( 'persists the bot access setting when its module is toggled off', async () => {
		// Arrange
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Act
		fireEvent.click( getModuleSwitch( BOT_ACCESS_SWITCH_INDEX ) );

		// Assert
		expect( screen.getByText( '4/5' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			bot_access_control: {
				enabled: false,
				bots: { GPTBot: { search: true, ai_input: true, ai_train: false } },
			},
		} );
		await waitFor( () => {
			expect( getModuleSwitch( BOT_ACCESS_SWITCH_INDEX ).disabled ).toBe( false );
		} );
	} );

	it( 'persists the agent discovery setting when its module is toggled off', async () => {
		// Arrange
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Act
		fireEvent.click( getModuleSwitch( AGENT_DISCOVERY_SWITCH_INDEX ) );

		// Assert
		expect( screen.getByText( '4/5' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			agent_discovery: { enabled: false },
		} );
		await waitFor( () => {
			expect( getModuleSwitch( AGENT_DISCOVERY_SWITCH_INDEX ).disabled ).toBe( false );
		} );
	} );

	it( 'persists the browser tools setting when its module is toggled off', async () => {
		// Arrange
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Act
		fireEvent.click( getModuleSwitch( BROWSER_TOOLS_SWITCH_INDEX ) );

		// Assert
		expect( screen.getByText( '4/5' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			browser_tools: { enabled: false },
		} );
		await waitFor( () => {
			expect( getModuleSwitch( BROWSER_TOOLS_SWITCH_INDEX ).disabled ).toBe( false );
		} );
	} );

	it( 'excludes unavailable browser tools from the total and locks its switch', () => {
		// Arrange & Act
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ { ...browserToolsConfig, isAvailable: false } } /> );

		// Assert
		const browserToolsSwitch = getModuleSwitch( BROWSER_TOOLS_SWITCH_INDEX );
		expect( browserToolsSwitch.checked ).toBe( false );
		expect( browserToolsSwitch.disabled ).toBe( true );
		expect( screen.getByText( '4/4' ) ).toBeTruthy();
	} );

	it( 'locks the bot access switch off when a physical robots.txt exists', () => {
		// Arrange & Act
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ { ...botAccessConfig, hasPhysicalFile: true } } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

		// Assert
		const botAccessSwitch = getModuleSwitch( BOT_ACCESS_SWITCH_INDEX );
		expect( botAccessSwitch.checked ).toBe( false );
		expect( botAccessSwitch.disabled ).toBe( true );
		expect( screen.getByText( '4/5' ) ).toBeTruthy();
	} );

	it( 'asks for confirmation before turning every module off', () => {
		// Arrange
		saveAgentReadySettings.mockClear();
		renderActiveApp();

		// Act
		clickTurnOff();

		// Assert
		expect( screen.getByText( 'Turn off Agent Ready?' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).not.toHaveBeenCalled();
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
	} );

	it( 'keeps every module on when the turn off confirmation is cancelled', () => {
		// Arrange
		saveAgentReadySettings.mockClear();
		renderActiveApp();
		clickTurnOff();

		// Act
		fireEvent.click( within( screen.getByRole( 'dialog' ) ).getByRole( 'button', { name: 'Cancel' } ) );

		// Assert
		expect( screen.queryByRole( 'dialog' ) ).toBeNull();
		expect( saveAgentReadySettings ).not.toHaveBeenCalled();
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
	} );

	it( 'turns every module off with one save once the confirmation is accepted', async () => {
		// Arrange
		saveAgentReadySettings.mockClear();
		renderActiveApp();
		clickTurnOff();

		// Act
		confirmTurnOff();

		// Assert
		expect( screen.getByText( '0/5' ) ).toBeTruthy();
		expect( saveAgentReadySettings ).toHaveBeenCalledTimes( 1 );
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			llms_txt: { enabled: false },
			markdown_content: { enabled: false },
			bot_access_control: { enabled: false },
			agent_discovery: { enabled: false },
			browser_tools: { enabled: false },
		} );
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog' ) ).toBeNull();
			expect( screen.getByText( 'Agent Ready is off' ) ).toBeTruthy();
		} );
	} );

	it( 'turns every module back on without a confirmation', async () => {
		// Arrange
		renderActiveApp();
		clickTurnOff();
		confirmTurnOff();
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Turn on' } ).disabled ).toBe( false );
		} );
		saveAgentReadySettings.mockClear();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Turn on' } ) );

		// Assert
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
		expect( screen.queryByRole( 'dialog' ) ).toBeNull();
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			llms_txt: { enabled: true },
			markdown_content: { enabled: true },
			bot_access_control: { enabled: true },
			agent_discovery: { enabled: true },
			browser_tools: { enabled: true },
		} );
		await waitFor( () => {
			expect( screen.getByText( 'Turn off Agent Ready' ) ).toBeTruthy();
		} );
	} );

	it( 'keeps offering to turn everything off while any module is still on', () => {
		// Arrange
		renderActiveApp();

		// Act
		fireEvent.click( getModuleSwitch( 0 ) );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Turn off' } ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Turn on' } ) ).toBeNull();
	} );

	it( 'leaves modules that cannot be toggled out of the bulk save', async () => {
		// Arrange
		saveAgentReadySettings.mockClear();
		renderActiveApp( { llmsConfig: { ...llmsConfig, hasPhysicalFile: true }, browserToolsConfig: { ...browserToolsConfig, isAvailable: false } } );
		clickTurnOff();

		// Act
		confirmTurnOff();

		// Assert
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			markdown_content: { enabled: false },
			bot_access_control: { enabled: false },
			agent_discovery: { enabled: false },
		} );
		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Turn on' } ) ).toBeTruthy();
		} );
	} );

	it( 'rolls every module back and shows an alert when the bulk save fails', async () => {
		// Arrange
		saveAgentReadySettings.mockRejectedValueOnce( null );
		renderActiveApp();
		clickTurnOff();

		// Act
		confirmTurnOff();

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Something went wrong. Please try again.' ) ).toBeTruthy();
			expect( screen.queryByRole( 'dialog' ) ).toBeNull();
		} );
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
		expect( screen.getByRole( 'button', { name: 'Turn off' } ) ).toBeTruthy();
	} );

	it( 'locks the module switches while the bulk save is running', async () => {
		// Arrange
		let resolveSave;
		saveAgentReadySettings.mockImplementationOnce( () => new Promise( ( resolve ) => {
			resolveSave = resolve;
		} ) );
		renderActiveApp();
		clickTurnOff();

		// Act
		confirmTurnOff();

		// Assert
		expect( getModuleSwitch( 0 ).disabled ).toBe( true );

		resolveSave();

		await waitFor( () => {
			expect( getModuleSwitch( 0 ).disabled ).toBe( false );
		} );
	} );

	it( 'opens the first module by default and restores its description when collapsed', () => {
		// Arrange
		render( <App isActivated agentDiscoveryConfig={ agentDiscoveryConfig } botAccessConfig={ botAccessConfig } llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } browserToolsConfig={ browserToolsConfig } /> );

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
		render( <ModulesStatus score={ 4 } total={ 4 } /> );

		// Assert
		expect( screen.getByText( '4/4' ) ).toBeTruthy();
		expect( screen.getByTestId( 'circle-check-icon' ) ).toBeTruthy();
	} );

	it( 'renders one segment per module and reaches success at the new total', () => {
		// Arrange & Act
		render( <ModulesStatus score={ 5 } total={ 5 } /> );

		// Assert
		expect( screen.getByText( '5/5' ) ).toBeTruthy();
		expect( screen.getByTestId( 'circle-check-icon' ) ).toBeTruthy();
	} );

	it( 'shows the warning icon when the score is partial', () => {
		// Arrange & Act
		render( <ModulesStatus score={ 1 } total={ 4 } /> );

		// Assert
		expect( screen.getByText( '1/4' ) ).toBeTruthy();
		expect( screen.getByTestId( 'alert-circle-icon' ) ).toBeTruthy();
	} );

	it( 'shows the error icon when the score is zero', () => {
		// Arrange & Act
		render( <ModulesStatus score={ 0 } total={ 4 } /> );

		// Assert
		expect( screen.getByText( '0/4' ) ).toBeTruthy();
		expect( screen.getByTestId( 'circle-x-icon' ) ).toBeTruthy();
	} );
} );
