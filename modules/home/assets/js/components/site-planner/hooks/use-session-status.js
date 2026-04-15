import { useState, useEffect } from 'react';

const useSessionStatus = ( sitePlannerData ) => {
	const [ sessionState, setSessionState ] = useState( 'no-usage' );
	const [ sessionStep, setSessionStep ] = useState( null );
	const [ sessionId, setSessionId ] = useState( null );

	useEffect( () => {
		if ( ! sitePlannerData?.connectAuth || ! sitePlannerData?.apiOrigin ) {
			setSessionState( 'no-usage' );
			setSessionId( null );
			setSessionStep( null );
			return;
		}

		const fetchSessionStatus = async () => {
			try {
				const { connectAuth, apiOrigin } = sitePlannerData;
				const response = await fetch( `${ apiOrigin }/website-planner/session/resolve-by-site`, {
					method: 'GET',
					headers: {
						'x-elementor-signature': connectAuth.signature || '',
						'access-token': connectAuth.accessToken || '',
						'client-id': connectAuth.clientId || '',
						'home-url': connectAuth.homeUrl || '',
						'site-key': connectAuth.siteKey || '',
					},
				} );

				if ( ! response.ok ) {
					throw new Error( 'Failed to fetch session status' );
				}

				const data = await response.json();

				if ( ! data?.sessionId ) {
					setSessionState( 'no-usage' );
					setSessionId( null );
					setSessionStep( null );
				} else {
					setSessionState( 'has-session' );
					setSessionStep( data.step );
					setSessionId( data.sessionId );
				}
			} catch {
				setSessionState( 'no-usage' );
				setSessionId( null );
				setSessionStep( null );
			}
		};

		fetchSessionStatus();
	}, [ sitePlannerData ] );

	return {
		sessionState,
		sessionStep,
		sessionId,
	};
};

export default useSessionStatus;
