import { injectIntoTop } from '@elementor/editor';

import { CreateWidget } from './components/create-widget';
import { CreateWidgetMenu } from './components/create-widget-menu';

export function init() {
	injectIntoTop( {
		id: 'create-widget',
		component: CreateWidget,
	} );

	injectIntoTop( {
		id: 'create-widget-menu',
		component: CreateWidgetMenu,
	} );
}
