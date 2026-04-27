import { useEffect, useState } from 'react';

const SETTINGS_PATH = 'elementor/v1/site-builder/snapshot';
const HOME_SCREEN_PATH = 'elementor/v1/site-builder/home-screen';
const DEFAULT_SITE_TYPE_SUGGESTIONS = Object.freeze( [
	'Business website',
	'Portfolio website',
	'E-commerce store',
] );

const sanitizeSuggestions = ( value, { limit } = {} ) => {
	const list = Array.isArray( value )
		? value.filter( ( item ) => 'string' === typeof item && item.trim() )
		: [];
	return limit ? list.slice( 0, limit ) : list;
};

const withDefaultSiteTypeSuggestions = ( value ) => {
	const stored = sanitizeSuggestions( value, { limit: 3 } );
	return stored.length ? stored : [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ];
};

const hasCompleteSnapshot = ( snapshotStep, snapshotEntry, plannerSteps ) => {
	if ( null === snapshotStep ) {
		return false;
	}
	if ( snapshotStep >= plannerSteps.DEPLOYED_TO_PLUGIN ) {
		return Array.isArray( snapshotEntry?.pageSuggestions ) && snapshotEntry.pageSuggestions.length > 0;
	}
	return true;
};

const hasEntryWithoutSession = ( snapshotEntry, snapshotStep ) =>
	snapshotEntry !== undefined && null === snapshotStep;

const deriveInitialStateForSiteKey = ( siteKey, snapshot, plannerSteps ) => {
	if ( ! siteKey ) {
		return {
			sessionStep: null,
			pageSuggestions: [],
			siteTypeSuggestions: [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ],
			isResolved: true,
		};
	}

	const snapshotEntry = snapshot[ siteKey ];
	const snapshotStep = Number.isFinite( snapshotEntry?.step ) ? snapshotEntry.step : null;

	if ( hasCompleteSnapshot( snapshotStep, snapshotEntry, plannerSteps ) ) {
		return {
			sessionStep: snapshotStep,
			pageSuggestions: sanitizeSuggestions( snapshotEntry?.pageSuggestions ),
			siteTypeSuggestions: sanitizeSuggestions( snapshotEntry?.siteTypeSuggestions, { limit: 3 } ),
			isResolved: true,
		};
	}

	const siteTypeSuggestions = withDefaultSiteTypeSuggestions( snapshotEntry?.siteTypeSuggestions );

	if ( hasEntryWithoutSession( snapshotEntry, snapshotStep ) ) {
		return {
			sessionStep: null,
			pageSuggestions: [],
			siteTypeSuggestions,
			isResolved: true,
		};
	}

	return {
		sessionStep: null,
		pageSuggestions: [],
		siteTypeSuggestions,
		isResolved: false,
	};
};

const useSiteBuilderState = ( siteBuilderData ) => {
	const plannerSteps = siteBuilderData?.plannerSteps;
	const siteKey = siteBuilderData?.siteKey || '';
	const snapshot = siteBuilderData?.site_builder_snapshot ?? {};
	const hasConnectAuth = Boolean( siteKey );
	const initial = deriveInitialStateForSiteKey( siteKey, snapshot, plannerSteps );
	const [ sessionStep, setSessionStep ] = useState( initial.sessionStep );
	const [ pageSuggestions, setPageSuggestions ] = useState( initial.pageSuggestions );
	const [ siteTypeSuggestions, setSiteTypeSuggestions ] = useState( initial.siteTypeSuggestions );
	const [ isLoading, setIsLoading ] = useState( ! initial.isResolved && hasConnectAuth );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		const applyState = ( next ) => {
			setSessionStep( next.sessionStep );
			setPageSuggestions( next.pageSuggestions );
			setSiteTypeSuggestions( next.siteTypeSuggestions );
			setIsLoading( false );
			setError( null );
		};

		if ( ! hasConnectAuth ) {
			applyState( {
				sessionStep: null,
				pageSuggestions: [],
				siteTypeSuggestions: [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ],
			} );
			return;
		}

		const snapshotEntry = snapshot[ siteKey ];
		const snapshotStep = Number.isFinite( snapshotEntry?.step ) ? snapshotEntry.step : null;

		if ( hasCompleteSnapshot( snapshotStep, snapshotEntry, plannerSteps ) ) {
			applyState( {
				sessionStep: snapshotStep,
				pageSuggestions: sanitizeSuggestions( snapshotEntry?.pageSuggestions ),
				siteTypeSuggestions: sanitizeSuggestions( snapshotEntry?.siteTypeSuggestions, { limit: 3 } ),
			} );
			return;
		}

		if ( hasEntryWithoutSession( snapshotEntry, snapshotStep ) ) {
			applyState( {
				sessionStep: null,
				pageSuggestions: [],
				siteTypeSuggestions: withDefaultSiteTypeSuggestions( snapshotEntry?.siteTypeSuggestions ),
			} );
			return;
		}

		let isMounted = true;
		const restHeaders = {
			'X-WP-Nonce': window.elementorHomeScreenData?.wpRestNonce || '',
		};
		const baseUrl = window.wpApiSettings?.root || '/wp-json/';
		const settingsUrl = `${ baseUrl }${ SETTINGS_PATH }`;

		const writeSnapshot = ( entry ) => fetch( settingsUrl, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...restHeaders,
			},
			body: JSON.stringify( {
				value: {
					...snapshot,
					[ siteKey ]: entry,
				},
			} ),
		} ).catch( () => {} );

		const fetchHomeScreen = async () => {
			setIsLoading( true );
			setError( null );

			try {
				const response = await fetch( `${ baseUrl }${ HOME_SCREEN_PATH }`, {
					method: 'GET',
					credentials: 'include',
					headers: restHeaders,
				} );

				if ( ! response.ok ) {
					const errorJson = await response.json().catch( () => ( {} ) );
					throw new Error( errorJson?.message || 'Failed to fetch home screen data' );
				}

				const data = await response.json();
				const nextStep = Number.isFinite( data?.step ) ? data.step : null;
				const nextSuggestions = sanitizeSuggestions( data?.pageNameSuggestions );
				const nextSiteTypeSuggestions = sanitizeSuggestions( data?.siteTypeSuggestions, { limit: 3 } );

				writeSnapshot( {
					sessionId: data?.sessionId ?? null,
					step: nextStep,
					pageSuggestions: nextSuggestions,
					siteTypeSuggestions: nextSiteTypeSuggestions,
				} );

				if ( isMounted ) {
					applyState( {
						sessionStep: nextStep,
						pageSuggestions: nextSuggestions,
						siteTypeSuggestions: nextSiteTypeSuggestions,
					} );
				}
			} catch ( loadError ) {
				if ( isMounted ) {
					setSessionStep( null );
					setPageSuggestions( [] );
					setSiteTypeSuggestions( [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ] );
					setError( loadError );
					setIsLoading( false );
				}
			}
		};

		fetchHomeScreen();

		return () => {
			isMounted = false;
		};
	}, [ siteKey, hasConnectAuth ] );

	return {
		sessionStep,
		pageSuggestions,
		siteTypeSuggestions,
		isLoading,
		error,
	};
};

export default useSiteBuilderState;
