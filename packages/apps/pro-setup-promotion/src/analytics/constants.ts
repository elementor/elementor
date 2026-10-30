export type ProSetupPromotionState = 'install' | 'activate' | 'connect';

export const TRACKING_WINDOW_NAME = 'pro_setup';
export const TRACKING_TARGET_LOCATION = 'widget_panel';
export const TRACKING_LOCATION_L1 = 'pro_setup_panel';

export const PANEL_VIEWED_EVENT = 'pro_setup_panel_viewed';
export const POPOVER_OPENED_EVENT = 'pro_setup_popover_opened';
export const PANEL_DISMISSED_EVENT = 'pro_setup_panel_dismissed';
export const CTA_CLICKED_EVENT = 'pro_setup_cta_clicked';
export const STEP_COMPLETED_EVENT = 'pro_setup_step_completed';

export const CTA_TARGET_NAMES: Record< ProSetupPromotionState, string > = {
	install: 'install_and_activate',
	activate: 'activate_pro',
	connect: 'connect_and_activate',
};
