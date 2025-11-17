import { useCallback } from 'react';
import safeRedirect from '../utils/safe-redirect';

export default function useReturnToRedirect( returnTo ) {
	const attemptRedirect = useCallback( ( fallbackAction ) => {
		if ( returnTo && safeRedirect( returnTo ) ) {
			return true;
		}

		if ( fallbackAction ) {
			fallbackAction();
		}

		return false;
	}, [ returnTo ] );

	return { attemptRedirect };
}

