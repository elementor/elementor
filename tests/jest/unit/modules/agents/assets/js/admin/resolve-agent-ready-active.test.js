import { resolveAgentReadyActive, resolveExperimentFlag } from 'elementor/modules/agents/assets/js/admin/scanner/resolve-agent-ready-active';

describe( 'resolveExperimentFlag', () => {
	it( 'treats boolean and numeric experiment flags as active', () => {
		expect( resolveExperimentFlag( true ) ).toBe( true );
		expect( resolveExperimentFlag( 1 ) ).toBe( true );
		expect( resolveExperimentFlag( '1' ) ).toBe( true );
		expect( resolveExperimentFlag( false ) ).toBe( false );
		expect( resolveExperimentFlag( 0 ) ).toBe( false );
		expect( resolveExperimentFlag( '0' ) ).toBe( false );
	} );
} );

describe( 'resolveAgentReadyActive', () => {
	const originalConfig = window.elementorAgentsReadyConfig;

	afterEach( () => {
		window.elementorAgentsReadyConfig = originalConfig;
	} );

	it( 'prefers the prop when it is active', () => {
		window.elementorAgentsReadyConfig = { isExperimentActive: false };

		expect( resolveAgentReadyActive( true ) ).toBe( true );
	} );

	it( 'falls back to the localized config when the prop is inactive', () => {
		window.elementorAgentsReadyConfig = { isExperimentActive: true };

		expect( resolveAgentReadyActive( false ) ).toBe( true );
	} );

	it( 'falls back to the scanner config block', () => {
		window.elementorAgentsReadyConfig = { scanner: { isExperimentActive: 1 } };

		expect( resolveAgentReadyActive( false ) ).toBe( true );
	} );
} );
