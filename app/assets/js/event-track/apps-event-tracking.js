import eventsConfig from '../../../../core/common/modules/events-manager/assets/js/events-config';

const EVENTS_MAP = {
	PAGE_VIEWS_WEBSITE_TEMPLATES: 'page_views_website_templates',
	KITS_CLOUD_UPGRADE_CLICKED: 'kits_cloud_upgrade_clicked',
	EXPORT_KIT_CUSTOMIZATION: 'export_kit_customization',
	IMPORT_KIT_CUSTOMIZATION: 'import_kit_customization',
	KIT_IMPORT_STATUS: 'kit_import_status',
	KIT_CLOUD_LIBRARY_APPLY: 'kit_cloud_library_apply',
	KIT_CLOUD_LIBRARY_DELETE: 'kit_cloud_library_delete',
	IMPORT_EXPORT_ADMIN_ACTION: 'ie_admin_action',
	KIT_IMPORT_UPLOAD_FILE: 'kit_import_upload_file',
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

export class AppsEventTracking {
	static dispatchEvent( eventName, payload ) {
		return elementorCommon.eventsManager.dispatchEvent( eventName, payload );
	}

	static sendPageViewsWebsiteTemplates( page ) {
		return this.dispatchEvent( EVENTS_MAP.PAGE_VIEWS_WEBSITE_TEMPLATES, {
			trigger: eventsConfig.triggers.pageLoaded,
			page_loaded: page,
			secondary_location: page,
		} );
	}

	static sendKitsCloudUpgradeClicked( upgradeLocation ) {
		return this.dispatchEvent( EVENTS_MAP.KITS_CLOUD_UPGRADE_CLICKED, {
			trigger: eventsConfig.triggers.click,
			secondary_location: upgradeLocation,
			upgrade_location: upgradeLocation,
		} );
	}

	static sendExportKitCustomization( payload ) {
		return this.dispatchEvent( EVENTS_MAP.EXPORT_KIT_CUSTOMIZATION, {
			trigger: eventsConfig.triggers.click,
			...payload,
		} );
	}

	static sendImportKitCustomization( payload ) {
		return this.dispatchEvent( EVENTS_MAP.IMPORT_KIT_CUSTOMIZATION, {
			trigger: eventsConfig.triggers.click,
			...payload,
		} );
	}

	static sendKitImportStatus( error = null ) {
		const isError = !! error;

		return this.dispatchEvent( EVENTS_MAP.KIT_IMPORT_STATUS, {
			kit_import_status: ! isError,
			...( isError && { kit_import_error: error.message } ),
		} );
	}

	static sendKitCloudLibraryApply( kitId, kitApplyUrl ) {
		return this.dispatchEvent( EVENTS_MAP.KIT_CLOUD_LIBRARY_APPLY, {
			trigger: eventsConfig.triggers.click,
			kit_cloud_id: kitId,
			...( kitApplyUrl && { kit_apply_url: kitApplyUrl } ),
		} );
	}

	static sendKitCloudLibraryDelete() {
		return this.dispatchEvent( EVENTS_MAP.KIT_CLOUD_LIBRARY_DELETE, {
			trigger: eventsConfig.triggers.click,
		} );
	}

	static sendImportExportAdminAction( actionType ) {
		return this.dispatchEvent( EVENTS_MAP.IMPORT_EXPORT_ADMIN_ACTION, {
			trigger: eventsConfig.triggers.click,
			action_type: actionType,
		} );
	}

	static sendKitImportUploadFile( status ) {
		return this.dispatchEvent( EVENTS_MAP.KIT_IMPORT_UPLOAD_FILE, {
			kit_import_upload_file_status: status,
		} );
	}
}
