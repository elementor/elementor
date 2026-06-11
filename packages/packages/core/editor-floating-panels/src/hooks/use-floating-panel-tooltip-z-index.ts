import { __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectPanelZIndex } from '../store/selectors';
import { FLOATING_PANEL_Z_INDEX_BASE } from '../utils/constants';

export function useFloatingPanelTooltipZIndex( panelId: string ): number {
	const panelZIndex = useSelector( ( state: GlobalState ) => selectPanelZIndex( state, panelId ) );

	return FLOATING_PANEL_Z_INDEX_BASE + panelZIndex + 1;
}
