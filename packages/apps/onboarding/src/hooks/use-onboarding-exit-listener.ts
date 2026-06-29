import { useEffect, useRef } from 'react';

import type { OnboardingChoices } from '../types';
import { getConfig, getOnboardingConfig } from '../utils/get-config';
import { redirectToSitePlanner } from '../utils/redirect-to-site-planner';

type RouterHistory = {
	listen: ( callback: ( update: { location: { pathname: string } } ) => void ) => () => void;
};

type ElementorAppPackages = {
	router?: {
		appHistory?: RouterHistory;
	};
};

function sendUserExitBeacon(): void {
	const config = getConfig();

	if ( ! config ) {
		return;
	}

	const body = JSON.stringify( { user_exit: true } );

	if ( navigator.sendBeacon ) {
		const blob = new Blob( [ body ], { type: 'application/json' } );
		navigator.sendBeacon( `${ config.restUrl }user-progress`, blob );
	}
}

export function useOnboardingExitListener( choices: OnboardingChoices ): void {
	const isExitingRef = useRef( false );
	const choicesRef = useRef( choices );

	choicesRef.current = choices;

	useEffect( () => {
		const config = getOnboardingConfig();

		if ( ! config?.shouldRedirectToSitePlanner || ! config.siteBuilderUrl ) {
			return;
		}

		const handlePageHide = () => {
			sendUserExitBeacon();
		};

		window.addEventListener( 'pagehide', handlePageHide );

		return () => {
			window.removeEventListener( 'pagehide', handlePageHide );
		};
	}, [] );

	useEffect( () => {
		const config = getOnboardingConfig();

		if ( ! config?.shouldRedirectToSitePlanner || ! config.siteBuilderUrl ) {
			return;
		}

		const appPackages = ( window as Window & { elementorAppPackages?: ElementorAppPackages } ).elementorAppPackages;
		const history = appPackages?.router?.appHistory;

		if ( ! history?.listen ) {
			return;
		}

		const unlisten = history.listen( ( { location } ) => {
			if ( isExitingRef.current ) {
				return;
			}

			if ( location.pathname.startsWith( '/onboarding' ) ) {
				return;
			}

			isExitingRef.current = true;
			redirectToSitePlanner( choicesRef.current );
		} );

		return unlisten;
	}, [] );
}
