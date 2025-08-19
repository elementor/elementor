
const EVENTS_MAP = {
	SAVE_TEMPLATE_CONTEXT_MENU_EXPOSURE: 'save_template_context_menu_exposure',
	NEW_SAVE_TEMPLATE_CLICKED: 'new_save_template_clicked',
	TEMPLATE_SAVED: 'template_saved',
	TEMPLATE_TRANSFER: 'template_transfer',
	ITEM_DELETED: 'item_deleted',
	TEMPLATE_IMPORT: 'template_import',
	TEMPLATE_RENAME: 'template_rename',
	TEMPLATE_INSERTED: 'template_inserted',
	BULK_ACTIONS_SUCCESS: 'bulk_actions',
	BULK_ACTIONS_FAILED: 'bulk_actions',
	FOLDER_CREATE: 'folder_create',
	QUOTA_BAR_CAPACITY: 'quota_bar_capacity',
	INSERT_APPLY_SETTINGS: 'insert_apply_settings',
	UPGRADE_CLICKED: 'upgrade_clicked',
	PAGE_VIEWED: 'page_viewed',
	DELETION_UNDO: 'deletion_undo',
};

export class EventManager {
	sendEvent( eventName, data ) {
		return elementorCommon.eventsManager.dispatchEvent(
			eventName,
			data,
		);
	}

	sendContextMenuExposureEvent() {
		return this.sendEvent( EVENTS_MAP.SAVE_TEMPLATE_CONTEXT_MENU_EXPOSURE, {
			location: elementorCommon.eventsManager.config.locations.elementorEditor,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.contextMenu,
			trigger: elementorCommon.eventsManager.config.triggers.visible,
		} );
	}

	sendNewSaveTemplateClickedEvent() {
		return this.sendEvent( EVENTS_MAP.NEW_SAVE_TEMPLATE_CLICKED, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModal,
			trigger: elementorCommon.eventsManager.config.triggers.click,
		} );
	}

	sendTemplateSavedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_SAVED, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModal,
			trigger: elementorCommon.eventsManager.config.triggers.click,
			...data,
		} );
	}

	sendTemplateTransferEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_TRANSFER, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendItemDeletedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.ITEM_DELETED, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.deleteDialog,
			...data,
		} );
	}

	sendTemplateImportEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_IMPORT, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendTemplateRenameEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_RENAME, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.renameDialog,
			...data,
		} );
	}

	sendTemplateInsertedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_INSERTED, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			...data,
		} );
	}

	sendBulkActionsSuccessEvent( data ) {
		return this.sendEvent( EVENTS_MAP.BULK_ACTIONS_SUCCESS, {
			bulk_status: 'success',
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendBulkActionsFailedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.BULK_ACTIONS_FAILED, {
			bulk_status: 'fail',
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendFolderCreateEvent() {
		return this.sendEvent( EVENTS_MAP.FOLDER_CREATE, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.createFolderDialog,
		} );
	}

	sendQuotaBarCapacityEvent( data ) {
		return this.sendEvent( EVENTS_MAP.QUOTA_BAR_CAPACITY, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			...data,
		} );
	}

	sendInsertApplySettingsEvent( data ) {
		return this.sendEvent( EVENTS_MAP.INSERT_APPLY_SETTINGS, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations.templateLibrary.applySettingsDialog,
			...data,
		} );
	}

	sendUpgradeClickedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.UPGRADE_CLICKED, {
			location: elementorCommon.eventsManager.config.locations.templatesLibrary.library,
			current_sub: elementor?.config?.library_connect?.current_access_tier,
			...data,
		} );
	}

	sendPageViewEvent( data ) {
		return this.sendEvent( EVENTS_MAP.PAGE_VIEWED, {
			page_loaded: data.location,
			...data,
		} );
	}

	sendDeletionUndoEvent( data ) {
		return this.sendEvent( EVENTS_MAP.DELETION_UNDO, {
			...data,
		} );
	}
}

