import { useCallback, useEffect, useRef } from 'react';
import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_TIMEOUT = SESSION_TIMEOUT_MINUTES * 60 * 1000;

export const useKitLibraryTracking = () => {
	const sessionStartTime = useRef( Date.now() );
	const lastActivityTime = useRef( Date.now() );
	const sessionEndedRef = useRef( false );
	const actionsCount = useRef( 0 );
	const filtersCount = useRef( 0 );
	const demoViews = useRef( 0 );
	const kitApplied = useRef( false );

	const { config = {} } = elementorCommon || {};
	const { editor_events: editorEvents = {} } = config;
	const { can_send_events: canSendEvents = false } = editorEvents;

	const isEventsManagerAvailable = useCallback( () => {
		return elementorCommon?.eventsManager &&
			'function' === typeof elementorCommon.eventsManager.dispatchEvent;
	}, [] );

	const trackMixpanelEvent = useCallback( ( eventName, properties = {}, callback = null ) => {
		try {
			if ( canSendEvents && isEventsManagerAvailable() ) {
				elementorCommon.eventsManager.dispatchEvent( eventName, properties );
			}
		} finally {
			if ( callback ) {
				callback();
			}
		}
	}, [ canSendEvents, isEventsManagerAvailable ] );

	const updateActivity = useCallback( () => {
		lastActivityTime.current = Date.now();
		sessionEndedRef.current = false;
	}, [] );

	const addTriggerToProperties = useCallback( ( properties, trigger ) => {
		if ( ! trigger ) {
			return properties;
		}

		return {
			...properties,
			trigger: eventsConfig.triggers[ trigger ] || trigger,
		};
	}, [] );

	const trackWithActivity = useCallback( ( eventName, properties, callback = null ) => {
		updateActivity();
		actionsCount.current += 1;
		trackMixpanelEvent( eventName, properties, callback );
	}, [ updateActivity, trackMixpanelEvent ] );

	const trackKitlibOpened = useCallback( ( source, callback = null, trigger = null ) => {
		const properties = addTriggerToProperties( { referrer_area: source }, trigger );
		trackWithActivity( 'kitlib_opened', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibCategorySelected = useCallback( ( kitCategory, callback = null, trigger = 'click' ) => {
		filtersCount.current += 1;
		const properties = addTriggerToProperties( { kit_category: kitCategory }, trigger );
		trackWithActivity( 'kitlib_category_selected', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibTagSelected = useCallback( ( kitTag, callback = null, trigger = 'click' ) => {
		filtersCount.current += 1;
		const properties = addTriggerToProperties( { kit_tag: kitTag }, trigger );
		trackWithActivity( 'kitlib_tag_selected', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibPlanFilterSelected = useCallback( ( planType, callback = null, trigger = 'click' ) => {
		filtersCount.current += 1;
		const properties = addTriggerToProperties( { kit_plan_filter: planType }, trigger );
		trackWithActivity( 'kitlib_plan_filter_selected', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibSorterSelected = useCallback( ( sortType, callback = null, trigger = 'dropdownClick' ) => {
		const properties = addTriggerToProperties( { kit_sorter: sortType }, trigger );
		trackWithActivity( 'kitlib_sorter_selected', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibSearchSubmitted = useCallback( ( searchTerm, resultsCount = null, callback = null, trigger = null ) => {
		const properties = addTriggerToProperties( {
			kit_search_input: searchTerm,
			kit_search_result_count: resultsCount,
		}, trigger );
		trackWithActivity( 'kitlib_search_submitted', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibFavoriteClicked = useCallback( ( kitId, title, favorited, callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
			kit_fav_status: favorited,
		}, trigger );
		trackWithActivity( 'kitlib_favorite_clicked', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibFavoriteTab = useCallback( ( callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( { page_url: window.location.href }, trigger );
		trackWithActivity( 'kitlib_favorite_tab', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoClicked = useCallback( ( kitId, title, position = null, plan = '', callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
			kit_position: position,
			requires_pro: plan,
		}, trigger );
		trackWithActivity( 'kitdemo_clicked', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoOpened = useCallback( ( kitId, title, loadTime = null, callback = null, trigger = 'pageLoaded' ) => {
		demoViews.current += 1;
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
			kit_load_time: loadTime,
		}, trigger );
		trackWithActivity( 'kitdemo_opened', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoApplyClicked = useCallback( ( kitId, title, plan = '', callback = null, trigger = 'click' ) => {
		kitApplied.current = true;
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
			requires_pro: plan,
		}, trigger );
		trackWithActivity( 'kitdemo_apply_clicked', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoApplyRemoveExisting = useCallback( ( userChoice, callback = null, trigger = null ) => {
		const properties = addTriggerToProperties( { remove_existing_kit: userChoice }, trigger );
		trackWithActivity( 'kitdemo_apply_remove_existing', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoApplyAllOrCustomize = useCallback( ( userChoice, callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( { apply_all: userChoice }, trigger );
		trackWithActivity( 'kitdemo_apply_all_or_customize', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoApplyCompleted = useCallback( ( kitId, importTime = null, itemsImported = null, callback = null, trigger = null ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			import_time: importTime,
			items_imported: itemsImported,
		}, trigger );
		trackWithActivity( 'kitdemo_apply_completed', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoApplyFailed = useCallback( ( kitId, errorMessage = null, errorCode = null, callback = null, trigger = null ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			error_message: errorMessage,
			error_code: errorCode,
		}, trigger );
		trackWithActivity( 'kitdemo_apply_failed', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoDownloadClicked = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
		}, trigger );
		trackWithActivity( 'kitdemo_download_clicked', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoUpgradeClicked = useCallback( ( kitId, title, plan = '', callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
			kit_demo_upgrade_plan: plan,
		}, trigger );
		trackWithActivity( 'kitdemo_upgrade_clicked', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoOverviewClicked = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
		}, trigger );
		trackWithActivity( 'kitdemo_overview_clicked', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitdemoOverviewBack = useCallback( ( kitId, title, callback = null, trigger = 'click' ) => {
		const properties = addTriggerToProperties( {
			kit_id: kitId,
			kit_title: title,
		}, trigger );
		trackWithActivity( 'kitdemo_overview_back', properties, callback );
	}, [ addTriggerToProperties, trackWithActivity ] );

	const trackKitlibSessionEnded = useCallback( ( reason = 'timeout' ) => {
		if ( sessionEndedRef.current ) {
			return;
		}

		sessionEndedRef.current = true;

		const durationMs = Date.now() - sessionStartTime.current;
		const durationSeconds = Number( ( durationMs / 1000 ).toFixed( 2 ) );

		trackMixpanelEvent( 'kitlib_session_ended', {
			duration_s: durationSeconds,
			actions_count: actionsCount.current,
			filters_count: filtersCount.current,
			demo_views: demoViews.current,
			kit_applied: kitApplied.current,
			reason,
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

