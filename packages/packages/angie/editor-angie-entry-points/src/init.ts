import { injectIntoControlHeader } from '@elementor/editor-controls';
import { injectIntoStyleTabHeader } from '@elementor/editor-editing-panel';

import { AngieControlHeaderAction } from './control-header/angie-control-header-action';
import { AngieStyleTabHeaderAction } from './style-section/angie-style-tab-header-action';

export function init(): void {
	injectIntoControlHeader( {
		id: 'angie-control-header-action',
		component: AngieControlHeaderAction,
	} );

	injectIntoStyleTabHeader( {
		id: 'angie-style-tab-header-action',
		component: AngieStyleTabHeaderAction,
	} );
}
