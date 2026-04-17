import { useEffect, useState } from 'react';

const CACHE_OPTION_KEY = 'elementor_site_planner_page_suggestions_cache';
const SETTINGS_PATH = `elementor/v1/settings/${ CACHE_OPTION_KEY }`;
const HOME_SCREEN_PATH = 'elementor/v1/site-planner/home-screen';

const getWpJsonRoot = () => {
	const root = window.wpApiSettings?.root || '/wp-json/';
	return root.endsWith( '/' ) ? root : `${ root }/`;
};

const getSettingResponseValue = ( responseJson ) => responseJson?.data?.value || responseJson?.value || {};

const normalizeCache = ( responseValue ) => {
	if ( typeof responseValue === 'string' ) {
		try {
			return JSON.parse( responseValue );
		} catch {
			return {};
		}
	}

	return responseValue && typeof responseValue === 'object' ? responseValue : {};
};

const sanitizeSuggestions = ( suggestions ) => Array.isArray( suggestions )
	? suggestions.filter( ( suggestion ) => typeof suggestion === 'string' )
	: [];

const hasCachedSuggestions = ( cacheEntry ) => Array.isArray( cacheEntry?.pageSuggestions ) && cacheEntry.pageSuggestions.length > 0;

const usePageNameSuggestions = ( sitePlannerData, shouldLoadSuggestions = true ) => {
	const [ pageSuggestions, setPageSuggestions ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		if ( ! sitePlannerData?.connectAuth ) {
			setPageSuggestions( [] );
			setIsLoading( false );
			setError( null );
			return;
		}

		let isMounted = true;
		const settingsHeaders = {
			'X-WP-Nonce': window.elementorHomeScreenData?.wpRestNonce || '',
		};

		const loadSuggestions = async () => {
			setIsLoading( true );
			setError( null );

			// if ( ! shouldLoadSuggestions ) {
			// 	if ( isMounted ) {
			// 		setPageSuggestions( [] );
			// 		setError( null );
			// 		setIsLoading( false );
			// 	}
			// 	return;
			// }

			// console.log( 'shouldLoadSuggestions', shouldLoadSuggestions );

			const settingsUrl = `${ getWpJsonRoot() }${ SETTINGS_PATH }`;
			let cacheValue = {};

			try {
				const settingsResponse = await fetch( settingsUrl, {
					method: 'GET',
					headers: settingsHeaders,
				} );

				console.log( 'settingsResponse', settingsResponse );

				if ( settingsResponse.ok ) {
					const responseJson = await settingsResponse.json();
					cacheValue = normalizeCache( getSettingResponseValue( responseJson ) );
				}

				if ( hasCachedSuggestions( cacheValue?.[ siteKey ] ) ) {
					if ( isMounted ) {
						setPageSuggestions( sanitizeSuggestions( cacheValue[ siteKey ].pageSuggestions ) );
						setError( null );
						setIsLoading( false );
					}
					return;
				}
			} catch {
				cacheValue = {};
			}

			try {
				const homeScreenUrl = `${ getWpJsonRoot() }${ HOME_SCREEN_PATH }`;
				const response = await fetch( homeScreenUrl, {
					method: 'GET',
					headers: settingsHeaders,
				} );

				console.log( 'response', response );

				if ( ! response.ok ) {
					const errorJson = await response.json();
					const errorMessage = errorJson?.message || 'Failed to fetch home screen data';
					throw new Error( errorMessage );
				}

				const data = await response.json();
				const sessionId = data?.sessionId || null;
				const suggestions = sanitizeSuggestions( data?.suggestions );

				if ( ! sessionId ) {
					if ( isMounted ) {
						setPageSuggestions( [] );
						setError( new Error( 'No active site planner session' ) );
						setIsLoading( false );
					}
					return;
				}

				const nextCache = {
					...cacheValue,
					[ siteKey ]: {
						sessionId,
						retrievedAt: new Date( Date.now() ).toISOString(),
						pageSuggestions: suggestions,
					},
				};

				await fetch( settingsUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...settingsHeaders,
					},
					body: JSON.stringify( { value: nextCache } ),
				} );

				if ( isMounted ) {
					setPageSuggestions( suggestions );
					setError( null );
				}
			} catch ( suggestionsError ) {
				if ( isMounted ) {
					setPageSuggestions( [] );
					setError( suggestionsError );
				}
			}

			if ( isMounted ) {
				setIsLoading( false );
			}
		};

		loadSuggestions();

		return () => {
			isMounted = false;
		};
	}, [
		sitePlannerData?.connectAuth?.siteKey,
		shouldLoadSuggestions,
	] );

	return {
		pageSuggestions,
		isLoading,
		error,
	};
};

export default usePageNameSuggestions;
