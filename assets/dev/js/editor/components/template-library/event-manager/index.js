
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
};

export class EventManager {
	sendEvent( eventName, data ) {
		return elementor.editorEvents.dispatchEvent(
			eventName,
			data,
		);
	}

	sendContextMenuExposureEvent() {
		return this.sendEvent( EVENTS_MAP.SAVE_TEMPLATE_CONTEXT_MENU_EXPOSURE, {
			location: elementor.editorEvents.config.locations.elementorEditor,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.contextMenu,
			trigger: elementor.editorEvents.config.triggers.visible,
		} );
	}

	sendNewSaveTemplateClickedEvent() {
		return this.sendEvent( EVENTS_MAP.NEW_SAVE_TEMPLATE_CLICKED, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModal,
			trigger: elementor.editorEvents.config.triggers.click,
		} );
	}

	sendTemplateTransferEvent( data ) {
		return this.sendEvent( EVENTS_MAP.NEW_SAVE_TEMPLATE_CLICKED, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendItemDeletedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.ITEM_DELETED, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.deleteDialog,
			...data,
		} );
	}

	sendTemplateImportEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_IMPORT, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendTemplateRenameEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_RENAME, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.renameDialog,
			...data,
		} );
	}

	sendTemplateInsertedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_INSERTED, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			...data,
		} );
	}

	sendBulkActionsSuccessEvent( data ) {
		return this.sendEvent( EVENTS_MAP.BULK_ACTIONS_SUCCESS, {
			bulk_status: 'success',
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendBulkActionsFailedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.BULK_ACTIONS_FAILED, {
			bulk_status: 'fail',
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.saveModal,
			...data,
		} );
	}

	sendFolderCreateEvent() {
		return this.sendEvent( EVENTS_MAP.FOLDER_CREATE, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.createFolderDialog,
		} );
	}

	sendQuotaBarCapacityEvent( data ) {
		return this.sendEvent( EVENTS_MAP.QUOTA_BAR_CAPACITY, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			...data,
		} );
	}

	sendInsertApplySettingsEvent( data ) {
		return this.sendEvent( EVENTS_MAP.INSERT_APPLY_SETTINGS, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.applySettingsDialog,
			...data,
		} );
	}

	sendUpgradeClickedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.UPGRADE_CLICKED, {
			location: elementor.editorEvents.config.locations.templatesLibrary.library,
			current_sub: elementor?.config?.library_connect?.current_access_tier,
			...data,
		} );
	}

	sendPageViewEvent( data ) {
		return this.sendEvent( EVENTS_MAP.UPGRADE_CLICKED, {
			page_loaded: data.location,
			...data,
		} );
	}
}

