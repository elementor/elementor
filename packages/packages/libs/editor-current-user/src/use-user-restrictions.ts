import { useCurrentUser } from './use-current-user';

export const DESIGN_RESTRICTION = 'design';

export const useUserRestrictions = () => {
	const { data } = useCurrentUser();

	const isRestricted = ( restriction: string ) => Boolean( data?.restrictions?.includes( restriction ) );

	return {
		isRestricted,
		restrictions: data?.restrictions,
		hasContentOnlyAccess: isRestricted( DESIGN_RESTRICTION ),
	};
};
