import { useCallback, useEffect, useRef } from 'react';
import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const SESSION_TIMEOUT = 30 * 60 * 1000;

export const useKitLibraryTracking = () => {
	const sessionStartTime = useRef( Date.now() );
	const lastActivityTime = useRef( Date.now() );
	const sessionEndedRef = useRef( false );

	const { config = {} } = elementorCommon || {};
	const { editor_events: editorEvents = {} } = config;
	const { can_send_events: canSendEvents = false } = editorEvents;

	const isEventsManagerAvailable = useCallback( () => {
		return elementorCommon?.eventsManager &&
			'function' === typeof elementorCommon.eventsManager.dispatchEvent;
	}, [] );

	const trackMixpanelEvent = useCallback( ( eventName, properties = {}, callback = null ) => {
		if ( ! canSendEvents || ! isEventsManagerAvailable() ) {
			if ( callback ) {
				callback();
			}
			return;
		}

		elementorCommon.eventsManager.dispatchEvent( eventName, properties );

		if ( callback ) {
			callback();
		}
	}, [ canSendEvents, isEventsManagerAvailable ] );

	const updateActivity = useCallback( () => {
		lastActivityTime.current = Date.now();
		sessionEndedRef.current = false;
	}, [] );

	const trackKitlibOpened = useCallback( ( source, callback = null, trigger = null ) => {
		updateActivity();
		const properties = {
			referrer_area: source,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_opened', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibCategorySelected = useCallback( ( kitCategory, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_category: kitCategory,
		};

		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_category_selected', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibTagSelected = useCallback( ( kitTag, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_tag: kitTag,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_tag_selected', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibPlanFilterSelected = useCallback( ( planType, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_plan_filter: planType,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_plan_filter_selected', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibSorterSelected = useCallback( ( sortType, callback = null, trigger = 'dropdownClick' ) => {
		updateActivity();
		const properties = {
			kit_sorter: sortType,
		};

		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}

		trackMixpanelEvent( 'kitlib_sorter_selected', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibSearchSubmitted = useCallback( ( searchTerm, resultsCount = null, callback = null, trigger = null ) => {
		updateActivity();
		const properties = {
			kit_search_input: searchTerm,
			kit_search_result_count: resultsCount,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_search_submitted', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibFavoriteClicked = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_favorite_clicked', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibFavoriteTab = useCallback( ( callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			page_url: window.location.href,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitlib_favorite_tab', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoClicked = useCallback( ( kitId, title, position = null, plan = '', callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
			kit_position: position,
			requires_pro: plan,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_clicked', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoOpened = useCallback( ( kitId, title, loadTime = null, callback = null, trigger = 'pageLoaded' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
			kit_load_time: loadTime,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_opened', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoApplyClicked = useCallback( ( kitId, title, plan = '', callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
			requires_pro: plan,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_apply_clicked', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoApplyRemoveExisting = useCallback( ( userChoice, callback = null, trigger = null ) => {
		updateActivity();
		const properties = {
			remove_existing_kit: userChoice,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_apply_remove_existing', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoApplyAllOrCustomize = useCallback( ( userChoice, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			apply_all: userChoice,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_apply_all_or_customize', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoApplyCompleted = useCallback( ( kitId, importTime = null, itemsImported = null, callback = null, trigger = null ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			import_time: importTime,
			items_imported: itemsImported,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_apply_completed', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoApplyFailed = useCallback( ( kitId, errorMessage = null, errorCode = null, callback = null, trigger = null ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			error_message: errorMessage,
			error_code: errorCode,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_apply_failed', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoDownloadClicked = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_download_clicked', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoUpgradeClicked = useCallback( ( kitId, title, plan = '', callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
			kit_demo_upgrade_plan: plan,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_upgrade_clicked', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoOverviewClicked = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_overview_clicked', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitdemoOverviewBack = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		updateActivity();
		const properties = {
			kit_id: kitId,
			kit_title: title,
		};
		if ( trigger ) {
			properties.trigger = eventsConfig.triggers[ trigger ] || trigger;
		}
		trackMixpanelEvent( 'kitdemo_overview_back', properties, callback );
	}, [ trackMixpanelEvent, updateActivity ] );

	const trackKitlibSessionEnded = useCallback( ( reason = 'timeout' ) => {
		if ( sessionEndedRef.current ) {
			return; // Prevent duplicate session end events
		}

		sessionEndedRef.current = true;
		const sessionDuration = Date.now() - sessionStartTime.current;

		trackMixpanelEvent( 'kitlib_session_ended', {
			session_duration: sessionDuration,
			reason, // 'timeout', 'page_unload', 'manual'
		} );
	}, [ trackMixpanelEvent ] );

	// Session timeout monitoring
	useEffect( () => {
		const checkSessionTimeout = () => {
			const timeSinceLastActivity = Date.now() - lastActivityTime.current;

			if ( timeSinceLastActivity > SESSION_TIMEOUT && ! sessionEndedRef.current ) {
				trackKitlibSessionEnded( 'timeout' );
			}
		};

		const interval = setInterval( checkSessionTimeout, 60000 ); // Check every minute

		// Track session end on page unload
		const handleBeforeUnload = () => {
			trackKitlibSessionEnded( 'page_unload' );
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		return () => {
			clearInterval( interval );
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [ trackKitlibSessionEnded ] );

	// Track activity on user interactions
	useEffect( () => {
		const handleUserActivity = () => {
			updateActivity();
		};

		const events = [ 'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click' ];
		events.forEach( ( event ) => {
			document.addEventListener( event, handleUserActivity, true );
		} );

		return () => {
			events.forEach( ( event ) => {
				document.removeEventListener( event, handleUserActivity, true );
			} );
		};
	}, [ updateActivity ] );

	return {
		// Library events
		trackKitlibOpened,
		trackKitlibCategorySelected,
		trackKitlibTagSelected,
		trackKitlibPlanFilterSelected,
		trackKitlibSorterSelected,
		trackKitlibSearchSubmitted,
		trackKitlibFavoriteClicked,
		trackKitlibFavoriteTab,

		// Demo/Preview events
		trackKitdemoClicked,
		trackKitdemoOpened,
		trackKitdemoApplyClicked,
		trackKitdemoApplyRemoveExisting,
		trackKitdemoApplyAllOrCustomize,
		trackKitdemoApplyCompleted,
		trackKitdemoApplyFailed,
		trackKitdemoDownloadClicked,
		trackKitdemoUpgradeClicked,
		trackKitdemoOverviewClicked,
		trackKitdemoOverviewBack,

		// Session events
		trackKitlibSessionEnded,

		// Utility
		updateActivity,
	};
};

export default useKitLibraryTracking;

