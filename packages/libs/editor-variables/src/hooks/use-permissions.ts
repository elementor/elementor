import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

export const usePermissions = () => {
	const { canUser, isAdmin } = useCurrentUserCapabilities();

	return {
		canAssign: () => canUser( 'edit_posts' ),
		canUnlink: () => canUser( 'edit_posts' ),
		canAdd: () => isAdmin,
		canDelete: () => isAdmin,
		canEdit: () => isAdmin,
		canRestore: () => isAdmin,
		canManageSettings: () => isAdmin,
	};
};
