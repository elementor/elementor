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

function toLowerSnake( value ) {
	return String( value || '' ).replace( /\s+/g, '_' ).toLowerCase();
}

function dispatchPopupClick( widgetName, { targetName, interactionResult, locationL1 } ) {
	const eventsManager = getEventsManager();

	if ( ! eventsManager?.dispatchEvent || ! widgetName ) {
		return;
	}

	const { config } = eventsManager;

	eventsManager.dispatchEvent( config.names.promotions.popupCtaClick, {
		app_type: config.appTypes.editor,
		window_name: config.appTypes.editor,
		interaction_type: toLowerSnake( config.triggers.click ),
		target_type: config.targetTypes.button,
		target_name: targetName,
		interaction_result: interactionResult,
		target_location: `locked_widget_promotion_${ widgetName }_popup`,
		location_l1: locationL1,
	} );
}

export function trackLockedWidgetPopupCtaClick( widgetName ) {
	const eventsManager = getEventsManager();
	if ( ! eventsManager?.config ) {
		return;
	}
	const { config } = eventsManager;

	dispatchPopupClick( widgetName, {
		targetName: config.interactionResults.upgradeNow,
		interactionResult: config.interactionResults.exitToLandingPage,
		locationL1: `locked_widget_promotion_${ widgetName }`,
	} );
}

export function trackLockedWidgetPopupCancel( widgetName ) {
	const eventsManager = getEventsManager();
	if ( ! eventsManager?.config ) {
		return;
	}
	const { config } = eventsManager;

	dispatchPopupClick( widgetName, {
		targetName: config.interactionResults.cancel,
		interactionResult: config.interactionResults.cancel,
		locationL1: 'cancel_button',
	} );
}
