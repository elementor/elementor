import { createMenu } from '@elementor/menus';

import Action from './action';
import { PopoverAction } from './popover-action';

export const controlActionsMenu = createMenu( {
	components: {
		Action,
		PopoverAction,
	},
} );
