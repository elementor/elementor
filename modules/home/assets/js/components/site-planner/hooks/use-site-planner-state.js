import { useEffect, useState } from 'react';

const SNAPSHOT_OPTION_KEY = 'elementor_site_planner_snapshot';
const SETTINGS_PATH = `elementor/v1/settings/${ SNAPSHOT_OPTION_KEY }`;
const HOME_SCREEN_PATH = 'elementor/v1/site-planner/home-screen';
const WIREFRAMES_STEP = 3;

const DEFAULT_SITE_TYPE_SUGGESTIONS = Object.freeze( [
	'Business website',
	'Portfolio website',
	'E-commerce store',
] );

const getWpJsonRoot = () => {
	const root = window.wpApiSettings?.root || '/wp-json/';
	return root.endsWith( '/' ) ? root : `${ root }/`;
};

const readInjectedSnapshot = () => {
	const raw = window.elementorHomeScreenData?.sitePlannerSnapshot;
	return raw && typeof raw === 'object' && ! Array.isArray( raw ) ? raw : {};
};

const sanitizeSuggestions = ( suggestions ) => ( Array.isArray( suggestions )
	? suggestions.filter( ( suggestion ) => typeof suggestion === 'string' )
	: [] );

const sanitizeSiteTypeSuggestions = ( value ) => {
	const list = Array.isArray( value )
		? value.filter( ( item ) => typeof item === 'string' && item.trim() )
		: [];
	return list.length ? list.slice( 0, 3 ) : [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ];
};

const deriveInitialStateForSiteKey = ( siteKey ) => {
	if ( ! siteKey ) {
		return {
			sessionStep: null,
			pageSuggestions: [],
			siteTypeSuggestions: [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ],
			isResolved: true,
		};
	}

	const snapshotEntry = readInjectedSnapshot()[ siteKey ];
	const snapshotStep = Number.isFinite( snapshotEntry?.step ) ? snapshotEntry.step : null;
	const hasSnapshotSuggestions = Array.isArray( snapshotEntry?.pageSuggestions );
	const siteTypeSuggestions = sanitizeSiteTypeSuggestions( snapshotEntry?.siteTypeSuggestions );

	if ( null !== snapshotStep && hasSnapshotSuggestions ) {
		return {
			sessionStep: snapshotStep,
			pageSuggestions: snapshotEntry.pageSuggestions,
			siteTypeSuggestions,
			isResolved: true,
		};
	}

	if ( null !== snapshotStep && snapshotStep < WIREFRAMES_STEP ) {
		return {
			sessionStep: snapshotStep,
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

const useSitePlannerState = ( sitePlannerData ) => {
	const connectAuth = sitePlannerData?.connectAuth;
	const hasConnectAuth = Boolean( connectAuth );
	const siteKey = connectAuth?.siteKey || '';
	const initial = deriveInitialStateForSiteKey( siteKey );
	const [ sessionStep, setSessionStep ] = useState( initial.sessionStep );
	const [ pageSuggestions, setPageSuggestions ] = useState( initial.pageSuggestions );
	const [ siteTypeSuggestions, setSiteTypeSuggestions ] = useState( initial.siteTypeSuggestions );
	const [ isLoading, setIsLoading ] = useState( ! initial.isResolved && hasConnectAuth );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		if ( ! hasConnectAuth ) {
			setSessionStep( null );
			setPageSuggestions( [] );
			setSiteTypeSuggestions( [ ...DEFAULT_SITE_TYPE_SUGGESTIONS ] );
			setIsLoading( false );
			setError( null );
			return;
		}

		const snapshotValue = readInjectedSnapshot();
		const snapshotEntry = snapshotValue[ siteKey ];
		const snapshotStep = Number.isFinite( snapshotEntry?.step ) ? snapshotEntry.step : null;
		const hasSnapshotSuggestions = Array.isArray( snapshotEntry?.pageSuggestions );

		if ( null !== snapshotStep && hasSnapshotSuggestions ) {
			setSessionStep( snapshotStep );
			setPageSuggestions( snapshotEntry.pageSuggestions );
			setSiteTypeSuggestions( sanitizeSiteTypeSuggestions( snapshotEntry?.siteTypeSuggestions ) );
			setIsLoading( false );
			setError( null );
			return;
		}

		let isMounted = true;
		const restHeaders = {
			'X-WP-Nonce': window.elementorHomeScreenData?.wpRestNonce || '',
		};
		const settingsUrl = `${ getWpJsonRoot() }${ SETTINGS_PATH }`;

		const writeSnapshot = ( entry ) => fetch( settingsUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...restHeaders,
			},
			body: JSON.stringify( {
				value: {
					...snapshotValue,
					[ siteKey ]: entry,
				},
			} ),
		} ).catch( () => {} );

		if ( null !== snapshotStep && snapshotStep < WIREFRAMES_STEP ) {
			const preservedSiteTypeSuggestions = sanitizeSiteTypeSuggestions( snapshotEntry?.siteTypeSuggestions );
			const nextEntry = {
				sessionId: snapshotEntry?.sessionId ?? null,
				step: snapshotStep,
				pageSuggestions: [],
				siteTypeSuggestions: preservedSiteTypeSuggestions,
			};
			writeSnapshot( nextEntry );
			setSessionStep( snapshotStep );
			setPageSuggestions( [] );
			setSiteTypeSuggestions( preservedSiteTypeSuggestions );
			setIsLoading( false );
			setError( null );
			return;
		}

		const fetchHomeScreen = async () => {
			setIsLoading( true );
			setError( null );

			try {
				const response = await fetch( `${ getWpJsonRoot() }${ HOME_SCREEN_PATH }`, {
					method: 'GET',
					headers: restHeaders,
				} );

				if ( ! response.ok ) {
					const errorJson = await response.json().catch( () => ( {} ) );
					throw new Error( errorJson?.message || 'Failed to fetch home screen data' );
				}

				const data = await response.json();
				const nextStep = Number.isFinite( data?.step ) ? data.step : null;
				const nextSuggestions = sanitizeSuggestions( data?.suggestions );
				const nextSiteTypeSuggestions = sanitizeSiteTypeSuggestions( data?.siteTypeSuggestions );
				const nextEntry = {
					sessionId: data?.sessionId ?? null,
					step: nextStep,
					pageSuggestions: nextSuggestions,
					siteTypeSuggestions: nextSiteTypeSuggestions,
				};

				writeSnapshot( nextEntry );

				if ( isMounted ) {
					setSessionStep( nextStep );
					setPageSuggestions( nextSuggestions );
					setSiteTypeSuggestions( nextSiteTypeSuggestions );
					setIsLoading( false );
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

export default useSitePlannerState;
