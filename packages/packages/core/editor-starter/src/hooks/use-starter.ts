import { useCallback, useEffect, useRef, useState } from 'react';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import apiFetch from '@wordpress/api-fetch';

import type { StarterConfig } from '../types';
import { deleteStarterConfig, getStarterConfig } from '../utils';

const EDITOR_WRAPPER_SELECTOR = '#elementor-editor-wrapper';
const STARTER_CONTAINER_ID = 'elementor-starter-container';

function markStarterDismissed( config: StarterConfig ) {
	apiFetch( {
		path: config.restPath,
		method: 'POST',
		data: { starter_dismissed: true },
	} );
}

export function useStarter() {
	const [ config, setConfig ] = useState< StarterConfig | null >( null );
	const [ isDismissing, setIsDismissing ] = useState( false );
	const [ portalContainer, setPortalContainer ] = useState< Element | null >( null );
	const dismissedRef = useRef( false );

	const dismiss = useCallback( () => {
		if ( ! config || dismissedRef.current ) {
			return;
		}

		dismissedRef.current = true;
		setIsDismissing( true );

		deleteStarterConfig();
	}, [ config ] );

	useEffect( () => {
		const insertStarters = () => {
			const starterConfig = getStarterConfig();

			if ( ! starterConfig ) {
				return;
			}

			const wrapper = document.querySelector( EDITOR_WRAPPER_SELECTOR );

			if ( ! wrapper ) {
				return;
			}

			const container = document.createElement( 'div' );
			container.id = STARTER_CONTAINER_ID;

			wrapper.prepend( container );

			setConfig( starterConfig );
			setPortalContainer( container );
			markStarterDismissed( starterConfig );
		};

		const onInsertStarters = ( event: Event ) => {
			const detail = ( event as CustomEvent )?.detail;

			if ( detail?.command === 'editor/documents/attach-preview' ) {
				insertStarters();
			}
		};

		window.addEventListener( 'elementor/commands/run/after', onInsertStarters );

		return () => window.removeEventListener( 'elementor/commands/run/after', onInsertStarters );
	}, [] );

	function openTemplatesLibrary() {
		if ( config?.kitLibraryUrl ) {
			const url = new URL( config.kitLibraryUrl, window.location.origin );
			url.searchParams.set( 'referrer', 'onboarding' );
			window.open( url.toString(), '_blank', 'noopener,noreferrer' );
		}
	}

	function openAiPlanner() {
		if ( config?.aiPlannerUrl ) {
			window.open( config.aiPlannerUrl, '_blank', 'noopener,noreferrer' );
		}
	}

	const onExited = useCallback( () => {
		portalContainer?.remove();
		setPortalContainer( null );
		setConfig( null );
	}, [ portalContainer ] );

	return {
		config,
		isDismissing,
		portalContainer,
		dismiss,
		openAiPlanner,
		openTemplatesLibrary,
		onExited,
	};
}
