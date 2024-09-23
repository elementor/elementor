export const STEPS_ROUTE = 'checklist/steps',
	USER_PROGRESS_ROUTE = 'checklist/user-progress';

export const STEP = {
	IS_MARKED_COMPLETED: 'is_marked_completed',
	IS_IMMUTABLE_COMPLETED: 'is_immutable_completed',
	IS_ABSOLUTE_COMPLETED: 'is_absolute_completed',
	PROMOTION_DATA: 'promotion_data',
};

export const USER_PROGRESS = {
	CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME: 'first_closed_checklist_in_editor',
	IS_POPUP_MINIMIZED: 'is_popup_minimized',
};

export const STEP_IDS_TO_COMPLETE_IN_EDITOR = [ 'add_logo', 'set_fonts_and_colors' ];

export const PANEL_ROUTES = {
	add_logo: 'panel/global/settings-site-identity',
	set_fonts_and_colors: 'panel/global/global-typography',
};
