import {
	AGENT_DISCOVERY_SETTINGS_KEY,
	BOT_ACCESS_SETTINGS_KEY,
	BROWSER_TOOLS_SETTINGS_KEY,
	LLMS_SETTINGS_KEY,
	MARKDOWN_SETTINGS_KEY,
} from 'elementor/modules/agents/assets/js/admin/constants';
import {
	getInitialModuleEnabled,
	getToggleModuleKey,
	getToggleSettingsPatch,
	hasDirtyModuleChecks,
	isAgentReadyModuleToggleDisabled,
} from 'elementor/modules/agents/assets/js/admin/scanner/scanner-check-settings';

describe( 'scanner-check-settings', () => {
	it( 'maps known toggle check ids to Agent Ready module keys', () => {
		// Assert
		expect( getToggleModuleKey( 'agent-path' ) ).toBe( AGENT_DISCOVERY_SETTINGS_KEY );
		expect( getToggleModuleKey( 'markdown-pages' ) ).toBe( MARKDOWN_SETTINGS_KEY );
		expect( getToggleModuleKey( 'webmcp-support' ) ).toBe( BROWSER_TOOLS_SETTINGS_KEY );
		expect( getToggleModuleKey( 'WebMCP-Support' ) ).toBe( BROWSER_TOOLS_SETTINGS_KEY );
		expect( getToggleModuleKey( 'webmcp-manifest' ) ).toBe( BROWSER_TOOLS_SETTINGS_KEY );
		expect( getToggleModuleKey( 'agent-browser-tools' ) ).toBe( BROWSER_TOOLS_SETTINGS_KEY );
		expect( getToggleModuleKey( 'unknown-check' ) ).toBeNull();
	} );

	it( 'builds enabled patches for toggle saves', () => {
		// Act
		const patch = getToggleSettingsPatch( 'agent-friendly-404s', true );

		// Assert
		expect( patch ).toEqual( {
			[ MARKDOWN_SETTINGS_KEY ]: { enabled: true },
		} );
		expect( getToggleSettingsPatch( 'webmcp-support', false ) ).toEqual( {
			[ BROWSER_TOOLS_SETTINGS_KEY ]: { enabled: false },
		} );
	} );

	it( 'reads effective module switches the same way as Agent Ready settings', () => {
		// Assert
		expect( getInitialModuleEnabled() ).toEqual( {
			[ LLMS_SETTINGS_KEY ]: false,
			[ MARKDOWN_SETTINGS_KEY ]: false,
			[ BOT_ACCESS_SETTINGS_KEY ]: false,
			[ AGENT_DISCOVERY_SETTINGS_KEY ]: false,
			[ BROWSER_TOOLS_SETTINGS_KEY ]: false,
		} );
		expect( getInitialModuleEnabled( {
			llmsConfig: { enabled: true, hasPhysicalFile: true },
			markdownConfig: { enabled: true },
			botAccessConfig: { enabled: true },
			agentDiscoveryConfig: { enabled: false },
			browserToolsConfig: { enabled: true, isAvailable: true },
		} ) ).toEqual( {
			[ LLMS_SETTINGS_KEY ]: false,
			[ MARKDOWN_SETTINGS_KEY ]: true,
			[ BOT_ACCESS_SETTINGS_KEY ]: true,
			[ AGENT_DISCOVERY_SETTINGS_KEY ]: false,
			[ BROWSER_TOOLS_SETTINGS_KEY ]: true,
		} );
		expect( getInitialModuleEnabled( {
			browserToolsConfig: { enabled: true, isAvailable: false },
		} )[ BROWSER_TOOLS_SETTINGS_KEY ] ).toBe( false );
	} );

	it( 'treats a module as pending only after its flag differs from the loaded snapshot', () => {
		// Arrange
		const checks = [ { id: 'markdown-pages' }, { id: 'public-api' } ];

		// Assert
		expect( hasDirtyModuleChecks( checks, {} ) ).toBe( false );
		expect( hasDirtyModuleChecks( checks, { [ MARKDOWN_SETTINGS_KEY ]: true } ) ).toBe( true );
		expect( hasDirtyModuleChecks( [ { id: 'public-api' } ], { [ MARKDOWN_SETTINGS_KEY ]: true } ) ).toBe( false );
	} );

	it( 'disables browser-tools toggles when Agent browser tools are unavailable', () => {
		// Assert
		expect( isAgentReadyModuleToggleDisabled( BROWSER_TOOLS_SETTINGS_KEY, {
			browserToolsConfig: { enabled: true, isAvailable: false },
		} ) ).toBe( true );
		expect( isAgentReadyModuleToggleDisabled( BROWSER_TOOLS_SETTINGS_KEY, {
			browserToolsConfig: { enabled: true, isAvailable: true },
		} ) ).toBe( false );
	} );
} );
