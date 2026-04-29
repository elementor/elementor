import { injectIntoLogic } from '@elementor/editor';

import { injectIntoClassSelectorActions } from '../css-classes/css-class-selector';
import { TriggerButton } from './components/trigger-button';
import { DialogHost } from './dialog-host';

export const init = () => {
	injectIntoClassSelectorActions( {
		id: 'design-system-import-trigger',
		component: TriggerButton,
	} );

	injectIntoLogic( {
		id: 'design-system-import-dialog',
		component: DialogHost,
	} );
};
