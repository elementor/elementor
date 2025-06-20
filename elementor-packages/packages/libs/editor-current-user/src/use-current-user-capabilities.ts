import { useCurrentUser } from './use-current-user';

export const useCurrentUserCapabilities = () => {
	const { data } = useCurrentUser();

	const canUser = ( capability: string ) => {
		return Boolean( data?.capabilities.includes( capability ) );
	};

	return { canUser, capabilities: data?.capabilities };
};
