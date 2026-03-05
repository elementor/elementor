import { useCallback, useEffect, useRef, useState } from 'react';
import { __privateRunCommand as runCommand, getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

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
	const apiFetch = (
		window as unknown as {
			wp?: { apiFetch?: ( args: object ) => Promise< unknown > };
		}
	 ).wp?.apiFetch;

	apiFetch?.( {
		path: config.restPath,
		method: 'POST',
		data: { starter_dismissed: true },
	} );
}

function showIframeHeader() {
	const iframeDoc = getCanvasIframeDocument();
	iframeDoc?.documentElement?.style.setProperty( '--e-starter-header-display', 'block' );
}

export function useStarter() {
	const [ config, setConfig ] = useState< StarterConfig | null >( null );
	const [ isDismissing, setIsDismissing ] = useState( false );
	const [ portalContainer, setPortalContainer ] = useState< Element | null >( null );
	const dismissedRef = useRef( false );
	const dismissRef = useRef< () => void >( () => {} );

	const runDismiss = useCallback( () => {
		if ( ! config || dismissedRef.current ) {
			return;
		}

		dismissedRef.current = true;
		setIsDismissing( true );

		dismissStarterApi( config );
		deleteStarterConfig();
	}, [ config ] );

	dismissRef.current = runDismiss;

	const dismiss = useCallback( () => {
		dismissRef.current();
	}, [] );

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

	useEffect( () => {
		if ( ! config ) {
			return;
		}

		const onElementAdded = ( e: Event ) => {
			const detail = ( e as CustomEvent )?.detail;

			if ( detail?.command === 'preview/drop' ) {
				dismiss();
			}
		};

		const channels = getElementorChannels();
		const handleDragStart = () => dismiss();

		window.addEventListener( 'elementor/commands/run/after', onElementAdded );
		channels?.panelElements?.on( 'element:drag:start', handleDragStart );

		return () => {
			window.removeEventListener( 'elementor/commands/run/after', onElementAdded );
			channels?.panelElements?.off( 'element:drag:start', handleDragStart );
		};
	}, [ config, dismiss ] );

	function openTemplatesLibrary() {
		dismiss();
		runCommand( 'library/open' );
	}

	function openAiPlanner() {
		dismiss();

		if ( config?.aiPlannerUrl ) {
			window.open( config.aiPlannerUrl, '_blank', 'noopener,noreferrer' );
		}
	}

	const onExited = useCallback( () => {
		showIframeHeader();

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
