import { useEffect, useState } from 'react';

const CACHE_OPTION_KEY = 'elementor_site_planner_page_suggestions_cache';
const SETTINGS_PATH = `elementor/v1/settings/${ CACHE_OPTION_KEY }`;
const SITEMAP_SUGGESTIONS_PATH = '/website-planner/sitemap';

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

const isSiteBuilderRoute = () => window.location.pathname.includes( '/wp-admin/admin.php' ) &&
	new URLSearchParams( window.location.search ).get( 'page' ) === 'elementor-app' &&
	window.location.hash === '#site-builder';

const usePageNameSuggestions = ( sitePlannerData ) => {
	const [ pageSuggestions, setPageSuggestions ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		const connectAuth = sitePlannerData?.connectAuth;
		const apiOrigin = sitePlannerData?.apiOrigin;
		const siteKey = connectAuth?.siteKey || '';

		if ( ! connectAuth || ! apiOrigin ) {
			setPageSuggestions( [] );
			setIsLoading( false );
			setError( null );
			return;
		}

		let isMounted = true;
		const settingsHeaders = {
			'X-WP-Nonce': window.wpApiSettings?.nonce || '',
		};

		const clearSitePlannerCache = async ( settingsUrl ) => {
			try {
				await fetch( settingsUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...settingsHeaders,
					},
					body: JSON.stringify( { value: {} } ),
				} );
			} catch {
			}
		};

		const fetchSessionId = async () => {
			const sessionResponse = await fetch( `${ apiOrigin }/website-planner/session/resolve-by-site`, {
				method: 'GET',
				headers: {
					'x-elementor-signature': connectAuth.signature || '',
					'access-token': connectAuth.accessToken || '',
					'client-id': connectAuth.clientId || '',
					'home-url': connectAuth.homeUrl || '',
					'site-key': siteKey,
				},
			} );

			if ( ! sessionResponse.ok ) {
				const errorJson = await sessionResponse.json();
				const errorMessage = errorJson?.message || 'Failed to fetch session status';
				throw new Error( errorMessage );
			}

			const sessionData = await sessionResponse.json();
			return sessionData?.sessionId || null;
		};

		const loadSuggestions = async () => {
			setIsLoading( true );
			setError( null );

			const settingsUrl = `${ getWpJsonRoot() }${ SETTINGS_PATH }`;
			let cacheValue = {};

			if ( isSiteBuilderRoute() ) {
				await clearSitePlannerCache( settingsUrl );
			}

			try {
				const settingsResponse = await fetch( settingsUrl, {
					method: 'GET',
					headers: settingsHeaders,
				} );

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
				const sessionId = await fetchSessionId();

				if ( ! sessionId ) {
					if ( isMounted ) {
						setPageSuggestions( [] );
						setError( new Error( 'No active site planner session' ) );
					}
					return;
				}

				const suggestionsResponse = await fetch( `${ apiOrigin }${ SITEMAP_SUGGESTIONS_PATH }/${ sessionId }/page-name-suggestions`, {
					method: 'POST',
					headers: {
						'x-elementor-signature': connectAuth.signature || '',
						'access-token': connectAuth.accessToken || '',
						'client-id': connectAuth.clientId || '',
						'home-url': connectAuth.homeUrl || '',
						'site-key': siteKey,
					},
				} );

				if ( ! suggestionsResponse.ok ) {
					const errorJson = await suggestionsResponse.json();
					const errorMessage = errorJson?.message || 'Failed to fetch page name suggestions';
					throw new Error( errorMessage );
				}

				const suggestionJson = await suggestionsResponse.json();
				const suggestions = sanitizeSuggestions( suggestionJson?.suggestions );

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
		sitePlannerData?.connectAuth?.signature,
		sitePlannerData?.connectAuth?.accessToken,
		sitePlannerData?.connectAuth?.clientId,
		sitePlannerData?.connectAuth?.homeUrl,
		sitePlannerData?.connectAuth?.siteKey,
		sitePlannerData?.apiOrigin,
	] );

	return {
		pageSuggestions,
		isLoading,
		error,
	};
};

export default usePageNameSuggestions;
