import { injectIntoTop } from '@elementor/editor';

import { GenerateWidget } from './components/generate-widget';

export function init() {
	injectIntoTop( {
		id: 'angie-generate-widget',
		component: GenerateWidget,
	} );
}
