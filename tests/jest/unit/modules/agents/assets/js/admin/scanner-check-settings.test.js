import { AGENT_DISCOVERY_SETTINGS_KEY, MARKDOWN_SETTINGS_KEY } from 'elementor/modules/agents/assets/js/admin/constants';
import { getToggleModuleKey, getToggleSettingsPatch } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-check-settings';

describe( 'scanner-check-settings', () => {
	it( 'maps known toggle check ids to Agent Ready module keys', () => {
		// Assert
		expect( getToggleModuleKey( 'agent-path' ) ).toBe( AGENT_DISCOVERY_SETTINGS_KEY );
		expect( getToggleModuleKey( 'markdown-pages' ) ).toBe( MARKDOWN_SETTINGS_KEY );
		expect( getToggleModuleKey( 'webmcp-support' ) ).toBe( AGENT_DISCOVERY_SETTINGS_KEY );
		expect( getToggleModuleKey( 'unknown-check' ) ).toBeNull();
	} );

	it( 'builds enabled patches for toggle saves', () => {
		// Act
		const patch = getToggleSettingsPatch( 'agent-friendly-404s', true );

		// Assert
		expect( patch ).toEqual( {
			[ MARKDOWN_SETTINGS_KEY ]: { enabled: true },
		} );
	} );
} );
