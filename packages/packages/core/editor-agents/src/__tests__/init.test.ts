import { injectSiteSettingsTab } from '@elementor/editor-site-settings';

const mockInjectSiteSettingsTab = injectSiteSettingsTab as jest.MockedFunction< typeof injectSiteSettingsTab >;

jest.mock( '@elementor/editor-site-settings', () => ( {
	injectSiteSettingsTab: jest.fn(),
} ) );

import { AGENTS_SITE_SETTINGS_TAB_ID, AgentsSettingsTab } from '../components/agents-settings-tab';
import { init } from '../init';

describe( 'init', () => {
	const originalExperimentalFeatures = window.elementorCommon?.config?.experimentalFeatures;

	afterEach( () => {
		if ( window.elementorCommon?.config ) {
			window.elementorCommon.config.experimentalFeatures = originalExperimentalFeatures ?? {};
		}

		jest.clearAllMocks();
	} );

	it( 'registers the agents site settings tab when the experiment is active', () => {
		// Arrange.
		window.elementorCommon = {
			config: {
				experimentalFeatures: {
					agents_llms_txt: true,
				},
			},
		} as typeof window.elementorCommon;

		// Act.
		init();

		// Assert.
		expect( mockInjectSiteSettingsTab ).toHaveBeenCalledWith( {
			id: AGENTS_SITE_SETTINGS_TAB_ID,
			component: AgentsSettingsTab,
		} );
	} );

	it( 'does not register the agents site settings tab when the experiment is inactive', () => {
		// Arrange.
		window.elementorCommon = {
			config: {
				experimentalFeatures: {},
			},
		} as typeof window.elementorCommon;

		// Act.
		init();

		// Assert.
		expect( mockInjectSiteSettingsTab ).not.toHaveBeenCalled();
	} );
} );
