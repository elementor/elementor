import { injectKitTab } from '@elementor/editor-kit-settings';

const mockInjectKitTab = injectKitTab as jest.MockedFunction< typeof injectKitTab >;

jest.mock( '@elementor/editor-kit-settings', () => ( {
	injectKitTab: jest.fn(),
} ) );

import { AGENTS_KIT_TAB_ID, AgentsSettingsTab } from '../components/agents-settings-tab';
import { init } from '../init';

describe( 'init', () => {
	const originalExperimentalFeatures = window.elementorCommon?.config?.experimentalFeatures;

	afterEach( () => {
		if ( window.elementorCommon?.config ) {
			window.elementorCommon.config.experimentalFeatures = originalExperimentalFeatures ?? {};
		}

		jest.clearAllMocks();
	} );

	it( 'registers the agents kit tab when the experiment is active', () => {
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
		expect( mockInjectKitTab ).toHaveBeenCalledWith( {
			id: AGENTS_KIT_TAB_ID,
			component: AgentsSettingsTab,
		} );
	} );

	it( 'does not register the agents kit tab when the experiment is inactive', () => {
		// Arrange.
		window.elementorCommon = {
			config: {
				experimentalFeatures: {},
			},
		} as typeof window.elementorCommon;

		// Act.
		init();

		// Assert.
		expect( mockInjectKitTab ).not.toHaveBeenCalled();
	} );
} );
