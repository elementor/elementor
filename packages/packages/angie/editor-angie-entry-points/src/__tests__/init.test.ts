import { injectIntoComponentInstanceHeader, injectIntoComponentsTabHeader } from '@elementor/editor-components';
import { injectIntoControlHeader } from '@elementor/editor-controls';
import {
	injectIntoClassSelectorActions,
	injectIntoCustomCssHeader,
	injectIntoStyleTabHeader,
} from '@elementor/editor-editing-panel';
import { injectIntoClassManagerHeader } from '@elementor/editor-global-classes';
import { injectIntoInteractionsHeader } from '@elementor/editor-interactions';
import { injectIntoVariableFormHeader, injectIntoVariablesManagerHeader } from '@elementor/editor-variables';

import { AngieComponentInstanceHeaderAction } from '../components/angie-component-instance-header-action';
import { AngieComponentsTabHeaderAction } from '../components/angie-components-tab-header-action';
import { AngieControlHeaderAction } from '../control-header/angie-control-header-action';
import { AngieClassManagerHeaderAction } from '../css-classes/angie-class-manager-header-action';
import { AngieClassSelectorAction } from '../css-classes/angie-class-selector-action';
import { init } from '../init';
import { AngieInteractionsHeaderAction } from '../interactions/angie-interactions-header-action';
import { AngieCustomCssHeaderAction } from '../style-section/angie-custom-css-header-action';
import { AngieStyleTabHeaderAction } from '../style-section/angie-style-tab-header-action';
import { AngieVariableFormHeaderAction } from '../variables/angie-variable-form-header-action';
import { AngieVariablesManagerHeaderAction } from '../variables/angie-variables-manager-header-action';

jest.mock( '@elementor/editor-components', () => ( {
	injectIntoComponentInstanceHeader: jest.fn(),
	injectIntoComponentsTabHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-controls', () => ( {
	injectIntoControlHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-editing-panel', () => ( {
	injectIntoClassSelectorActions: jest.fn(),
	injectIntoCustomCssHeader: jest.fn(),
	injectIntoStyleTabHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-global-classes', () => ( {
	injectIntoClassManagerHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-interactions', () => ( {
	injectIntoInteractionsHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-variables', () => ( {
	injectIntoVariableFormHeader: jest.fn(),
	injectIntoVariablesManagerHeader: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects Angie actions into every entry point location', () => {
		// Act
		init();

		// Assert
		expect( injectIntoControlHeader ).toHaveBeenCalledWith( {
			id: 'angie-control-header-action',
			component: AngieControlHeaderAction,
		} );
		expect( injectIntoStyleTabHeader ).toHaveBeenCalledWith( {
			id: 'angie-style-tab-header-action',
			component: AngieStyleTabHeaderAction,
		} );
		expect( injectIntoCustomCssHeader ).toHaveBeenCalledWith( {
			id: 'angie-custom-css-header-action',
			component: AngieCustomCssHeaderAction,
		} );
		expect( injectIntoClassSelectorActions ).toHaveBeenCalledWith( {
			id: 'angie-class-selector-action',
			component: AngieClassSelectorAction,
		} );
		expect( injectIntoClassManagerHeader ).toHaveBeenCalledWith( {
			id: 'angie-class-manager-header-action',
			component: AngieClassManagerHeaderAction,
		} );
		expect( injectIntoInteractionsHeader ).toHaveBeenCalledWith( {
			id: 'angie-interactions-header-action',
			component: AngieInteractionsHeaderAction,
		} );
		expect( injectIntoVariableFormHeader ).toHaveBeenCalledWith( {
			id: 'angie-variable-form-header-action',
			component: AngieVariableFormHeaderAction,
		} );
		expect( injectIntoVariablesManagerHeader ).toHaveBeenCalledWith( {
			id: 'angie-variables-manager-header-action',
			component: AngieVariablesManagerHeaderAction,
		} );
		expect( injectIntoComponentInstanceHeader ).toHaveBeenCalledWith( {
			id: 'angie-component-instance-header-action',
			component: AngieComponentInstanceHeaderAction,
		} );
		expect( injectIntoComponentsTabHeader ).toHaveBeenCalledWith( {
			id: 'angie-components-tab-header-action',
			component: AngieComponentsTabHeaderAction,
		} );
	} );
} );
