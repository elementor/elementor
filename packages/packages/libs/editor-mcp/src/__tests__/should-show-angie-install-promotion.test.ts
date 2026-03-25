import {
	isAngiePluginActive,
	isEditorUserAdministrator,
	shouldShowAngieInstallPromotion,
} from '../utils/should-show-angie-install-promotion';

describe( 'should-show-angie-install-promotion', () => {
	const originalElementor = ( window as Window & { elementor?: unknown } ).elementor;

	afterEach( () => {
		( window as Window & { elementor?: unknown } ).elementor = originalElementor;
	} );

	it( 'returns false when elementor config is missing', () => {
		delete ( window as Window & { elementor?: unknown } ).elementor;

		expect( isAngiePluginActive() ).toBe( false );
		expect( isEditorUserAdministrator() ).toBe( false );
		expect( shouldShowAngieInstallPromotion() ).toBe( false );
	} );

	it( 'treats angie as active only when is_angie_active is true', () => {
		( window as Window & { elementor?: unknown } ).elementor = {
			config: { is_angie_active: false, user: { is_administrator: false } },
		};

		expect( isAngiePluginActive() ).toBe( false );
		expect( shouldShowAngieInstallPromotion() ).toBe( false );

		( window as Window & { elementor?: unknown } ).elementor = {
			config: { is_angie_active: true, user: { is_administrator: false } },
		};

		expect( isAngiePluginActive() ).toBe( true );
		expect( shouldShowAngieInstallPromotion() ).toBe( true );
	} );

	it( 'shows promotion for administrators when angie is not active', () => {
		( window as Window & { elementor?: unknown } ).elementor = {
			config: { is_angie_active: false, user: { is_administrator: true } },
		};

		expect( shouldShowAngieInstallPromotion() ).toBe( true );
	} );
} );
