import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

export const usePermissions = () => {
	const { canUser } = useCurrentUserCapabilities();

	return {
		canAssign: () => canUser( 'edit_posts' ),
		canUnlink: () => canUser( 'edit_posts' ),
		canAdd: () => canUser( 'manage_options' ),
		canDelete: () => canUser( 'manage_options' ),
		canEdit: () => canUser( 'manage_options' ),
		canRestore: () => canUser( 'manage_options' ),
		canManageSettings: () => canUser( 'manage_options' ),
	};
};
