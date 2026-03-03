import { useCurrentUser } from './use-current-user';

export const ADMIN_CAPABILITY = 'manage_options';

export const useCurrentUserCapabilities = () => {
	const { data } = useCurrentUser();

	const canUser = ( capability: string ) => {
		return Boolean( data?.capabilities.includes( capability ) );
	};

	const isAdmin = Boolean( data?.capabilities.includes( ADMIN_CAPABILITY ) );

	return { canUser, isAdmin, capabilities: data?.capabilities };
};
