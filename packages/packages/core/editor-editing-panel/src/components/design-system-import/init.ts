import { injectIntoLogic } from '@elementor/editor';

import { injectIntoClassSelectorActions } from '../css-classes/css-class-selector';
import { TriggerButton } from './components/trigger-button';
import { DialogHost } from './dialog-host';

export const init = () => {
	// TEMP: trigger lives next to the class manager only for QA. Move to the design system tab and remove this injection before merging the connected PR.
	injectIntoClassSelectorActions( {
		id: 'design-system-import-trigger',
		component: TriggerButton,
	} );

	injectIntoLogic( {
		id: 'design-system-import-dialog',
		component: DialogHost,
	} );
};
