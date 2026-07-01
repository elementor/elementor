export function normalizeWidgetName( widgetType ) {
	return String( widgetType || '' )
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '_' )
		.replace( /^_+|_+$/g, '' );
}

function getEventsManager() {
	return typeof elementorCommon !== 'undefined' ? elementorCommon.eventsManager : null;
}

export function trackLockedWidgetPopupShown( widgetName ) {
	const eventsManager = getEventsManager();

	if ( ! eventsManager?.dispatchEvent || ! widgetName ) {
		return;
	}

	const { config } = eventsManager;

	eventsManager.dispatchEvent( config.names.promotions.popupOpened, {
		app_type: config.appTypes.editor,
		window_name: config.appTypes.editor,
		interaction_type: config.interactionResults.popupShown,
		target_type: config.targetTypes.popup,
		target_name: `locked_widget_promotion_${ widgetName }_popup`,
		interaction_result: config.interactionResults.popupViewed,
		target_location: config.appTypes.editor,
		location_l1: 'widget_panel',
	} );
}

export function trackLockedWidgetPopupClick( widgetName, action ) {
	const eventsManager = getEventsManager();

	if ( ! eventsManager?.dispatchEvent || ! widgetName ) {
		return;
	}

	const { config } = eventsManager;
	const isUpgrade = 'upgrade_now' === action;

	eventsManager.dispatchEvent( config.names.promotions.popupCtaClick, {
		app_type: config.appTypes.editor,
		window_name: config.appTypes.editor,
		interaction_type: 'click',
		target_type: config.targetTypes.button,
		target_name: action,
		interaction_result: isUpgrade
			? config.interactionResults.exitToLandingPage
			: config.interactionResults.cancel,
		target_location: `locked_widget_promotion_${ widgetName }_popup`,
		location_l1: isUpgrade
			? `locked_widget_promotion_${ widgetName }`
			: 'cancel_button',
	} );
}
