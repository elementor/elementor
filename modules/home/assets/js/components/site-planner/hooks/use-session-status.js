import { useState, useEffect } from 'react';

const getWpJsonRoot = () => {
	const root = window.wpApiSettings?.root || '/wp-json/';
	return root.endsWith( '/' ) ? root : `${ root }/`;
};

const useSessionStatus = ( sitePlannerData ) => {
	const [ sessionState, setSessionState ] = useState( 'no-usage' );
	const [ sessionStep, setSessionStep ] = useState( null );
	const [ sessionId, setSessionId ] = useState( null );

	const resetSession = () => {
		setSessionState( 'no-usage' );
		setSessionId( null );
		setSessionStep( null );
	};

	useEffect( () => {
		if ( ! sitePlannerData?.connectAuth ) {
			resetSession();
			return;
		}

		const fetchSessionStatus = async () => {
			try {
				const proxyUrl = `${ getWpJsonRoot() }elementor/v1/site-planner/home-screen`;
				const response = await fetch( proxyUrl, {
					method: 'GET',
					headers: {
						'X-WP-Nonce': window.elementorHomeScreenData?.wpRestNonce || '',
					},
				} );

				if ( ! response.ok ) {
					throw new Error( 'Failed to fetch session status' );
				}

				const data = await response.json();

				if ( ! data?.sessionId ) {
					return resetSession();
				}

				setSessionState( 'has-session' );
				setSessionStep( data.step );
				setSessionId( data.sessionId );
			} catch {
				resetSession();
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
