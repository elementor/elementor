import type { ProSetupPromotionState } from './constants';

const panelViewedStatesThisSession = new Set< ProSetupPromotionState >();

export function shouldTrackPanelViewForState( state: ProSetupPromotionState ): boolean {
	if ( panelViewedStatesThisSession.has( state ) ) {
		return false;
	}

	panelViewedStatesThisSession.add( state );

	return true;
}

export function resetPanelViewSessionForTests(): void {
	panelViewedStatesThisSession.clear();
}
