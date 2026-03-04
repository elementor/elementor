import { useCallback, useEffect, useRef, useState } from 'react';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import type { StarterConfig } from '../types';
import { deleteStarterConfig, getStarterConfig } from '../utils';

const PREVIEW_WRAPPER_SELECTOR = '#elementor-preview-responsive-wrapper';

interface ElementorChannels {
	panelElements?: {
		on: ( event: string, callback: () => void ) => void;
		off: ( event: string, callback: () => void ) => void;
	};
}

function getElementorChannels(): ElementorChannels | undefined {
	return ( window as unknown as { elementor?: { channels?: ElementorChannels } } ).elementor?.channels;
}

function dismissStarterApi( config: StarterConfig ) {
	const apiFetch = ( window as unknown as { wp?: { apiFetch?: ( args: object ) => Promise< unknown > } } ).wp
		?.apiFetch;

	apiFetch?.( {
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

	useEffect( () => {
		const activate = () => {
			const cfg = getStarterConfig();

			if ( ! cfg ) {
				return;
			}

			const wrapper = document.querySelector( PREVIEW_WRAPPER_SELECTOR );

			if ( ! wrapper ) {
				return;
			}

			const container = document.createElement( 'div' );
			container.id = 'elementor-starter-container';

			wrapper.prepend( container );

			setConfig( cfg );
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
		if ( ! config ) {
			return;
		}

		const channels = getElementorChannels();

		if ( ! channels?.panelElements ) {
			return;
		}

		const handleDragStart = () => dismiss();

		channels.panelElements.on( 'element:drag:start', handleDragStart );

		return () => {
			channels.panelElements?.off( 'element:drag:start', handleDragStart );
		};
	}, [ config, dismiss ] );

	const openTemplatesLibrary = useCallback( () => {
		dismiss();
		runCommand( 'library/open' );
	}, [ dismiss ] );

	const openAiPlanner = useCallback( () => {
		dismiss();

		if ( config?.aiPlannerUrl ) {
			window.open( config.aiPlannerUrl, '_blank', 'noopener,noreferrer' );
		}
	}, [ config, dismiss ] );

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
