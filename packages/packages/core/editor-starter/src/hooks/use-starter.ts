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

const STARTER_HIDE_STYLE_ID = 'e-starter-hide-elements';
const EMPTY_WRAP = 'body:not(:has(.elementor-section-wrap.ui-sortable *))';

const STARTER_HIDE_CSS = `
	${ EMPTY_WRAP } header.wp-block-template-part,
	${ EMPTY_WRAP } footer.wp-block-template-part,
	${ EMPTY_WRAP } [data-elementor-type="floating-buttons"] { display: none !important; }
	${ EMPTY_WRAP } { background-color: #fff !important; padding-top: 0 !important; }
	${ EMPTY_WRAP } #elementor-add-new-section { margin-top: 0 !important; }
	${ EMPTY_WRAP } .elementor-section-wrap.ui-sortable { min-height: 0 !important; }
	${ EMPTY_WRAP } .elementor-add-section:not(.elementor-dragging-on-child) .elementor-add-section-inner { background-color: transparent !important; max-width: 604px !important; margin-top: 120px !important; }
`;

let iframeLoadHandler: ( () => void ) | null = null;

function hideIframeElements() {
	const iframe = document.getElementById( 'elementor-preview-iframe' ) as HTMLIFrameElement | null;

	if ( ! iframe ) {
		return;
	}

	const injectStyle = () => {
		if ( ! iframe.contentDocument || iframe.contentDocument.getElementById( STARTER_HIDE_STYLE_ID ) ) {
			return;
		}

		const style = iframe.contentDocument.createElement( 'style' );
		style.id = STARTER_HIDE_STYLE_ID;
		style.textContent = STARTER_HIDE_CSS;
		iframe.contentDocument.head.appendChild( style );
	};

	iframeLoadHandler = injectStyle;
	iframe.addEventListener( 'load', injectStyle );
	injectStyle();

	iframe.style.boxShadow = 'initial';
}

function closeNavigator() {
	const navigatorEl = document.getElementById( 'elementor-navigator' );

	if ( navigatorEl ) {
		runCommand( 'navigator/close' );
	}
}

function showIframeElements() {
	const iframeDoc = getCanvasIframeDocument();
	iframeDoc?.documentElement?.style.setProperty( '--e-starter-header-display', 'block' );
	iframeDoc?.getElementById( STARTER_HIDE_STYLE_ID )?.remove();

	const iframe = document.getElementById( 'elementor-preview-iframe' ) as HTMLIFrameElement | null;

	if ( iframe ) {
		iframe.style.boxShadow = '';

		if ( iframeLoadHandler ) {
			iframe.removeEventListener( 'load', iframeLoadHandler );
			iframeLoadHandler = null;
		}
	}
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

			dismissStarterApi( cfg );

			hideIframeElements();
			closeNavigator();

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

		const iframe = document.getElementById( 'elementor-preview-iframe' ) as HTMLIFrameElement | null;
		const sectionWrap = iframe?.contentDocument?.querySelector( '.elementor-section-wrap.ui-sortable' );
		let observer: MutationObserver | null = null;

		if ( sectionWrap ) {
			observer = new MutationObserver( ( mutations ) => {
				const hasAddedNodes = mutations.some( ( m ) => m.addedNodes.length > 0 );

				if ( hasAddedNodes && sectionWrap.children.length > 0 ) {
					dismiss();
				}
			} );

			observer.observe( sectionWrap, { childList: true } );
		}

		window.addEventListener( 'elementor/commands/run/after', onElementAdded );
		channels?.panelElements?.on( 'element:drag:start', handleDragStart );

		return () => {
			window.removeEventListener( 'elementor/commands/run/after', onElementAdded );
			channels?.panelElements?.off( 'element:drag:start', handleDragStart );
			observer?.disconnect();
		};
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
		showIframeElements();

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
