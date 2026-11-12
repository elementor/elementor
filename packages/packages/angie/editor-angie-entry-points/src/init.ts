import { injectIntoComponentInstanceHeader } from '@elementor/editor-components';
import { injectIntoControlHeader } from '@elementor/editor-controls';
import { injectIntoClassSelectorActions, injectIntoCustomCssHeader } from '@elementor/editor-editing-panel';
import { injectIntoClassManagerHeader } from '@elementor/editor-global-classes';
import { injectIntoInteractionsHeader } from '@elementor/editor-interactions';
import { injectIntoVariableFormHeader, injectIntoVariablesManagerHeader } from '@elementor/editor-variables';

import { AngieComponentInstanceHeaderAction } from './components/angie-component-instance-header-action';
import { AngieControlHeaderAction } from './control-header/angie-control-header-action';
import { AngieClassManagerHeaderAction } from './css-classes/angie-class-manager-header-action';
import { AngieClassSelectorAction } from './css-classes/angie-class-selector-action';
import { AngieInteractionsHeaderAction } from './interactions/angie-interactions-header-action';
import { AngieCustomCssHeaderAction } from './style-section/angie-custom-css-header-action';
import { AngieVariableFormHeaderAction } from './variables/angie-variable-form-header-action';
import { AngieVariablesManagerHeaderAction } from './variables/angie-variables-manager-header-action';

export function init(): void {
	injectIntoControlHeader( {
		id: 'angie-control-header-action',
		component: AngieControlHeaderAction,
	} );

	injectIntoCustomCssHeader( {
		id: 'angie-custom-css-header-action',
		component: AngieCustomCssHeaderAction,
	} );

	injectIntoClassSelectorActions( {
		id: 'angie-class-selector-action',
		component: AngieClassSelectorAction,
	} );

	injectIntoClassManagerHeader( {
		id: 'angie-class-manager-header-action',
		component: AngieClassManagerHeaderAction,
	} );

	injectIntoInteractionsHeader( {
		id: 'angie-interactions-header-action',
		component: AngieInteractionsHeaderAction,
	} );

	injectIntoVariableFormHeader( {
		id: 'angie-variable-form-header-action',
		component: AngieVariableFormHeaderAction,
	} );

	injectIntoVariablesManagerHeader( {
		id: 'angie-variables-manager-header-action',
		component: AngieVariablesManagerHeaderAction,
	} );

	injectIntoComponentInstanceHeader( {
		id: 'angie-component-instance-header-action',
		component: AngieComponentInstanceHeaderAction,
	} );
}
