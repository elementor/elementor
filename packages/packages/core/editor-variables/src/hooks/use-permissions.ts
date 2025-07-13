import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

export const usePermissions = () => {
	const { canUser: userCan } = useCurrentUserCapabilities();

	return {
		canAssign: () => userCan( 'edit_posts' ),
		canUnlink: () => userCan( 'edit_posts' ),
		canAdd: () => userCan( 'manage_options' ),
		canDelete: () => userCan( 'manage_options' ),
		canEdit: () => userCan( 'manage_options' ),
		canRestore: () => userCan( 'manage_options' ),
		canManageSettings: () => userCan( 'manage_options' ),
	};
};
