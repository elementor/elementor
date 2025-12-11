import { createError } from '@elementor/utils';

export const ComponentRenameFailedError = createError< { componentUid: string } >( {
	code: 'component_rename_failed',
	message: 'Failed to rename component',
} );

export const ComponentRenameFailedToSyncToNavigatorError = createError< { componentUid: string } >( {
	code: 'component_rename_failed_to_sync_to_navigator',
	message: 'Failed to sync component rename to navigator',
} );

export const ComponentRenameFailedToSyncToNavigatorStoreError = createError< { componentUid: string } >( {
	code: 'component_rename_failed_to_sync_to_navigator_store',
	message: 'Failed to sync component rename to navigator store',
} );

export const ComponentRenameFailedToUpdateElementWithComponentRenameError = createError< { elementId: string } >( {
	code: 'component_rename_failed_to_update_element_with_component_rename',
	message: 'Failed to update element with component rename',
} );

export const ComponentRenameSyncStoreNotReadyError = createError< Record< string, never > >( {
	code: 'component_rename_sync_store_not_ready',
	message: 'Store not ready yet, sync will be initialized later',
} );
