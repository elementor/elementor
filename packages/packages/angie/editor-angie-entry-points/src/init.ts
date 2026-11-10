import { injectIntoControlHeader } from '@elementor/editor-controls';

import { AngieControlHeaderAction } from './control-header/angie-control-header-action';

export function init(): void {
	injectIntoControlHeader( {
		id: 'angie-control-header-action',
		component: AngieControlHeaderAction,
	} );
}
