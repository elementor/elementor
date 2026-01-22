import { PopoverAction } from '@elementor/editor-ui';
import { createMenu } from '@elementor/menus';

import Action from './action';

export const controlActionsMenu = createMenu( {
	components: {
		Action,
		PopoverAction,
	},
} );
