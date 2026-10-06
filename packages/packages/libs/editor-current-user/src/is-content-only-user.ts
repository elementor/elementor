import { getCurrentUser } from './get-current-user';
import { DESIGN_RESTRICTION } from './use-user-restrictions';

export const isContentOnlyUser = () => {
	return Boolean( getCurrentUser()?.restrictions?.includes( DESIGN_RESTRICTION ) );
};
