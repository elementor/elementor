import { useCallback, useEffect, useRef, useState } from 'react';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import apiFetch from '@wordpress/api-fetch';

import type { StarterConfig } from '../types';
import { deleteStarterConfig, getStarterConfig } from '../utils';

const EDITOR_WRAPPER_SELECTOR = '#elementor-editor-wrapper';
const STARTER_CONTAINER_ID = 'elementor-starter-container';

function dismissStarterApi( config: StarterConfig ) {
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

		dismissStarterApi( config );
		deleteStarterConfig();
	}, [ config ] );

	useEffect( () => {
		const activate = () => {
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

			wrapper.append( container );

			dismissStarterApi( starterConfig );

			setConfig( starterConfig );
			setPortalContainer( container );
		};

		const onCommandAfter = ( e: Event ) => {
			const detail = ( e as CustomEvent )?.detail;

			if ( detail?.command === 'editor/documents/attach-preview' ) {
				activate();
			}
		};

		window.addEventListener( 'elementor/commands/run/after', onCommandAfter );

		return () => window.removeEventListener( 'elementor/commands/run/after', onCommandAfter );
	}, [] );

	useEffect( () => {
		if ( ! config ) {
			return;
		}

		const onCommandAfter = ( event: Event ) => {
			const detail = ( event as CustomEvent )?.detail;

			if ( detail?.command === 'document/elements/import' ) {
				dismiss();
			}
		};

		window.addEventListener( 'elementor/commands/run/after', onCommandAfter );

		return () => window.removeEventListener( 'elementor/commands/run/after', onCommandAfter );
	}, [ config, dismiss ] );

	function openTemplatesLibrary() {
		runCommand( 'library/open' );
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
