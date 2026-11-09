import { createFloatingPanel } from '@elementor/editor-floating-panels';
import { AngieIcon } from '@elementor/icons';

import AngiePanel from './components/angie-panel';
import {
	ANGIE_PANEL_DEFAULT_HEIGHT,
	ANGIE_PANEL_DEFAULT_WIDTH,
	ANGIE_PANEL_ID,
	ANGIE_PANEL_MIN_HEIGHT,
	ANGIE_PANEL_MIN_WIDTH,
	ANGIE_PANEL_TOP_OFFSET,
} from './constants';

export const angiePanel = createFloatingPanel( {
	id: ANGIE_PANEL_ID,
	title: 'Angie',
	icon: AngieIcon,
	component: AngiePanel,
	isDocked: true,
	keepMounted: true,
	persistOpenState: true,
	defaults: {
		width: ANGIE_PANEL_DEFAULT_WIDTH,
		height: ANGIE_PANEL_DEFAULT_HEIGHT,
		minWidth: ANGIE_PANEL_MIN_WIDTH,
		minHeight: ANGIE_PANEL_MIN_HEIGHT,
		corner: 'block-start-inline-end',
		initialPosition: {
			insetInlineEnd: 0,
			insetBlockStart: ANGIE_PANEL_TOP_OFFSET,
		},
	},
} );
