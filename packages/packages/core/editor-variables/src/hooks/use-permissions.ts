import { useState } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

export const usePermissions = () => {
	const { canUser: userCan } = useCurrentUserCapabilities();

	const [ permissions ] = useState( () => {
		return {
			assign: userCan( 'edit_posts' ),
			unlink: userCan( 'edit_posts' ),

			add: userCan( 'manage_options' ),
			edit: userCan( 'manage_options' ),
			delete: userCan( 'manage_options' ),
			restore: userCan( 'manage_options' ),

			manageSettings: userCan( 'manage_options' ),
		};
	} );

	return {
		canAssign: () => !! permissions?.assign,
		canUnlink: () => !! permissions?.unlink,
		canAdd: () => !! permissions?.add,
		canDelete: () => !! permissions?.delete,
		canEdit: () => !! permissions?.edit,
		canRestore: () => !! permissions?.restore,
		canManageSettings: () => !! permissions?.manageSettings,
	};
};
