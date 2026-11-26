import { getAngieState, isAngieEnabled } from '../is-angie-enabled';

type EditorAngieConfig = NonNullable< Window[ 'elementorEditorAngie' ] >;

const setAngieConfig = ( config: Partial< EditorAngieConfig > ) => {
	window.elementorEditorAngie = config as EditorAngieConfig;
};

describe( 'isAngieEnabled', () => {
	const originalConfig = window.elementorEditorAngie;

	beforeEach( () => {
		window.elementorEditorAngie = undefined;
	} );

	afterEach( () => {
		window.elementorEditorAngie = originalConfig;
	} );

	it( 'is enabled when the plugin is active', () => {
		setAngieConfig( {
			hasConsent: false,
			isAngiePluginActive: true,
			isBlockedBySite: false,
			isExperimentActive: true,
			isUserDisabled: false,
		} );

		expect( isAngieEnabled() ).toBe( true );
		expect( getAngieState() ).toBe( 'plugin' );
	} );

	it( 'is enabled with consent when the plugin is inactive', () => {
		setAngieConfig( {
			hasConsent: true,
			isAngiePluginActive: false,
			isBlockedBySite: false,
			isExperimentActive: true,
			isUserDisabled: false,
		} );

		expect( isAngieEnabled() ).toBe( true );
		expect( getAngieState() ).toBe( 'sdk' );
	} );

	it( 'is disabled when consent is missing', () => {
		setAngieConfig( {
			hasConsent: false,
			isAngiePluginActive: false,
			isBlockedBySite: false,
			isExperimentActive: true,
			isUserDisabled: false,
		} );

		expect( isAngieEnabled() ).toBe( false );
		expect( getAngieState() ).toBe( 'promo' );
	} );

	it( 'is hidden when the user disabled Angie', () => {
		setAngieConfig( {
			hasConsent: true,
			isAngiePluginActive: true,
			isBlockedBySite: false,
			isExperimentActive: true,
			isUserDisabled: true,
		} );

		expect( isAngieEnabled() ).toBe( false );
		expect( getAngieState() ).toBe( 'hidden' );
	} );

	it( 'is hidden when the site blocks Angie', () => {
		setAngieConfig( {
			hasConsent: true,
			isAngiePluginActive: true,
			isBlockedBySite: true,
			isExperimentActive: true,
			isUserDisabled: false,
		} );

		expect( isAngieEnabled() ).toBe( false );
		expect( getAngieState() ).toBe( 'hidden' );
	} );

	it( 'is hidden when the experiment is inactive', () => {
		setAngieConfig( {
			hasConsent: true,
			isAngiePluginActive: true,
			isBlockedBySite: false,
			isExperimentActive: false,
			isUserDisabled: false,
		} );

		expect( isAngieEnabled() ).toBe( false );
		expect( getAngieState() ).toBe( 'hidden' );
	} );
} );
