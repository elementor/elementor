import { PopoverAction } from '@elementor/editor-ui';

import Action from './action';
import { createMenu } from './create-menu';

export const controlActionsMenu = createMenu( {
	components: {
		Action,
		PopoverAction,
	},
} );
