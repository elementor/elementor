import { DESIGN_RESTRICTION, useUserRestrictions } from './use-user-restrictions';

export const useHasContentOnlyAccess = () => useUserRestrictions().isRestricted( DESIGN_RESTRICTION );
