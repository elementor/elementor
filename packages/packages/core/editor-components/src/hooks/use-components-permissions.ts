import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

export const useComponentsPermissions = () => {
	const { isAdmin } = useCurrentUserCapabilities();

	return {
		canCreate: isAdmin,
		canEdit: isAdmin,
		canDelete: isAdmin,
		canRename: isAdmin,
	};
};
