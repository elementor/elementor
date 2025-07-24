import ComponentBase from 'elementor-api/modules/component-base';
import mixpanel from 'mixpanel-browser';
import eventsConfig from '../../../../modules/editor-events/assets/js/editor/events-config';

const EVENTS_MAP = {
	PAGE_VIEWS_WEBSITE_TEMPLATES: 'page_views_website_templates',
	KITS_CLOUD_UPGRADE_CLICKED: 'kits_cloud_upgrade_clicked',
	EXPORT_KIT_CUSTOMIZATION: 'export_kit_customization',
	KIT_IMPORT_STATUS: 'kit_import_status',
	KIT_CLOUD_LIBRARY_APPLY: 'kit_cloud_library_apply',
	KIT_CLOUD_LIBRARY_DELETE: 'kit_cloud_library_delete',
};

export const appsEventTrackingDispatch = ( command, eventParams ) => {
	// Add existing eventParams key value pair to the data/details object.
	const objectCreator = ( array, obj ) => {
		for ( const key of array ) {
			if ( eventParams.hasOwnProperty( key ) && eventParams[ key ] !== null ) {
				obj[ key ] = eventParams[ key ];
			}
		}
		return obj;
	};

	const dataKeys = [];
	const detailsKeys = [ 'layout', 'site_part', 'error', 'document_name', 'document_type', 'view_type_clicked', 'tag', 'sort_direction', 'sort_type', 'action', 'grid_location', 'kit_name', 'page_source', 'element_position', 'element', 'event_type', 'modal_type', 'method', 'status', 'step', 'item', 'category', 'element_location', 'search_term', 'section', 'site_area' ];
	const data = {};
	const details = {};

	const init = () => {
		objectCreator( detailsKeys, details );
		objectCreator( dataKeys, data );

		const commandSplit = command.split( '/' );
		data.placement = commandSplit[ 0 ];
		data.event = commandSplit[ 1 ];

		// If 'details' is not empty, add the details object to the data object.
		if ( Object.keys( details ).length ) {
			data.details = details;
		}
	};

	init();

	$e.run( command, data );
};

export class Events extends ComponentBase {
	onInit() {
		this.config = eventsConfig;

		if ( elementorAppConfig.events_config.can_send_events ) {
			mixpanel.init( elementorAppConfig.events_config?.token, { persistence: 'localStorage' } );

			const userId = elementorCommonConfig.library_connect?.user_id;

			if ( userId ) {
				mixpanel.identify( userId );

				mixpanel.register( {
					appType: 'App',
				} );

				mixpanel.people.set_once( {
					$user_id: userId,
					$last_login: new Date().toISOString(),
				} );
			}
		}
	}
	getNamespace() {
		return 'elementor-app-events';
	}

	dispatchEvent( eventName, payload ) {
		if ( ! elementorAppConfig.events_config.can_send_events ) {
			return;
		}

		const eventData = {
			user_id: elementorCommonConfig.library_connect?.user_id || null,
			subscription_id: elementorAppConfig.events_config?.subscription_id || null,
			user_tier: elementorCommonConfig.library_connect?.current_access_tier || null,
			url: elementorAppConfig.events_config?.site_url,
			wp_version: elementorAppConfig.events_config?.wp_version,
			client_id: elementorAppConfig.events_config?.site_key,
			app_version: elementorAppConfig.events_config?.elementor_version,
			site_language: elementorAppConfig.events_config?.site_language,
			...payload,
		};

		mixpanel.track( eventName, eventData );
	}

	sendPageViewsWebsiteTemplates( page ) {
		return this.dispatchEvent( EVENTS_MAP.PAGE_VIEWS_WEBSITE_TEMPLATES, {
			trigger: eventsConfig.triggers.pageLoaded,
			page_loaded: page,
			secondary_location: page,
		} );
	}

	sendKitsCloudUpgradeClicked( upgradeLocation ) {
		return this.dispatchEvent( EVENTS_MAP.KITS_CLOUD_UPGRADE_CLICKED, {
			trigger: eventsConfig.triggers.click,
			secondary_location: upgradeLocation,
			upgrade_location: upgradeLocation,
		} );
	}

	sendExportKitCustomization( payload ) {
		return this.dispatchEvent( EVENTS_MAP.EXPORT_KIT_CUSTOMIZATION, {
			trigger: eventsConfig.triggers.click,
			...payload,
		} );
	}

	sendKitImportStatus( error = null ) {
		return this.dispatchEvent( EVENTS_MAP.KIT_IMPORT_STATUS, {
			kit_import_status: ! error,
			...( error && { kit_import_error: error.message } ),
		} );
	}

	sendKitCloudLibraryApply( kitId, kitApplyUrl ) {
		return this.dispatchEvent( EVENTS_MAP.KIT_CLOUD_LIBRARY_APPLY, {
			trigger: eventsConfig.triggers.click,
			kit_cloud_id: kitId,
			...( kitApplyUrl && { kit_apply_url: kitApplyUrl } ),
		} );
	}

	sendKitCloudLibraryDelete() {
		return this.dispatchEvent( EVENTS_MAP.KIT_CLOUD_LIBRARY_DELETE, {
			trigger: eventsConfig.triggers.click,
		} );
	}
}
