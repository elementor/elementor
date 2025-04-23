
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
};

export class EventManager {
	sendEvent( eventName, data ) {
		return elementor.editorEvents.dispatchEvent(
			eventName,
			{
				location: elementor.editorEvents.config.locations.elementorEditor,
				secondaryLocation: elementor.editorEvents.config.secondaryLocations.contextMenu,
				trigger: elementor.editorEvents.config.triggers.visible,
				...data,
			},
		);
	}

	sendContextMenuExposureEvent() {
		return this.sendEvent( EVENTS_MAP.SAVE_TEMPLATE_CONTEXT_MENU_EXPOSURE );
	}

	sendNewSaveTemplateClickedEvent() {
		return this.sendEvent( EVENTS_MAP.NEW_SAVE_TEMPLATE_CLICKED );
	}

	sendTemplateSavedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.NEW_SAVE_TEMPLATE_CLICKED, data );
	}

	sendTemplateTransferEvent( data ) {
		return this.sendEvent( EVENTS_MAP.NEW_SAVE_TEMPLATE_CLICKED, data );
	}

	sendItemDeletedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.ITEM_DELETED, data );
	}

	sendTemplateImportEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_IMPORT, data );
	}

	sendTemplateRenameEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_RENAME, data );
	}

	sendTemplateInsertedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.TEMPLATE_INSERTED, data );
	}

	sendBulkActionsSuccessEvent( data ) {
		return this.sendEvent( EVENTS_MAP.BULK_ACTIONS_SUCCESS, {
			bulk_status: 'success',
			...data,
		} );
	}

	sendBulkActionsFailedEvent( data ) {
		return this.sendEvent( EVENTS_MAP.BULK_ACTIONS_FAILED, {
			bulk_status: 'fail',
			...data,
		} );
	}

	sendFolderCreateEvent() {
		return this.sendEvent( EVENTS_MAP.FOLDER_CREATE );
	}

	sendQuotaBarCapacityEvent( data ) {
		return this.sendEvent( EVENTS_MAP.QUOTA_BAR_CAPACITY, data );
	}

	sendInsertApplySettingsEvent( data ) {
		return this.sendEvent( EVENTS_MAP.INSERT_APPLY_SETTINGS, data );
	}
}

