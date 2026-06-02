import * as EditorAppBar from '@elementor/editor-app-bar';
import { PlayerPlayIcon } from '@elementor/icons';

const APP_URL = 'http://localhost:5173/';
const APP_ORIGIN = new URL( APP_URL ).origin;

const InteractionsPoc = elementorModules.editor.utils.Module.extend( {
	buildPageContext() {
		const previewFrame = elementor.$preview?.[ 0 ];
		const previewDoc = previewFrame?.contentDocument;

		if ( ! previewDoc ) {
			return {
				html: '',
				elementIds: [],
			};
		}

		const elementIds = Array.from( previewDoc.querySelectorAll( '[data-id]' ) )
			.map( ( el ) => el.getAttribute( 'data-id' ) )
			.filter( Boolean );

		return {
			html: previewDoc.documentElement.outerHTML,
			elementIds,
		};
	},

	postInitToIframe( iframe ) {
		if ( ! iframe?.contentWindow ) {
			return;
		}

		iframe.contentWindow.postMessage( {
			type: 'init',
			page: this.buildPageContext(),
		}, APP_ORIGIN );
	},

	openInteractionsEditor() {
		if ( this.activeOverlay ) {
			return;
		}

		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;flex-direction:column;background:#fff';

		const closeButton = document.createElement( 'button' );
		closeButton.type = 'button';
		closeButton.textContent = 'Close';
		closeButton.setAttribute( 'aria-label', 'Close Interactions Editor' );
		closeButton.style.cssText = 'position:absolute;top:12px;right:12px;z-index:1;padding:8px 16px;cursor:pointer';
		closeButton.addEventListener( 'click', () => this.closeInteractionsEditor() );

		const iframe = document.createElement( 'iframe' );
		iframe.src = APP_URL;
		iframe.title = 'Interactions Editor';
		iframe.style.cssText = 'flex:1;width:100%;border:0';
		iframe.addEventListener( 'load', () => {
			this.postInitToIframe( iframe );
		} );

		overlay.appendChild( iframe );
		overlay.appendChild( closeButton );
		document.body.appendChild( overlay );

		this.activeOverlay = overlay;
		this.activeIframe = iframe;

		const onKeyDown = ( event ) => {
			if ( 'Escape' === event.key ) {
				this.closeInteractionsEditor();
			}
		};

		const onMessage = ( event ) => {
			if ( event.origin !== APP_ORIGIN ) {
				return;
			}

			const { type } = event.data || {};

			if ( 'ready' === type ) {
				this.postInitToIframe( iframe );
				return;
			}

			if ( 'save' === type ) {
				// TODO: define multi-element save contract (per-id settings vs bulk command).
				iframe.contentWindow.postMessage( { type: 'saved', ok: true }, APP_ORIGIN );
				this.closeInteractionsEditor();
				return;
			}

			if ( 'close' === type ) {
				this.closeInteractionsEditor();
			}
		};

		this.onKeyDown = onKeyDown;
		this.onMessage = onMessage;
		window.addEventListener( 'keydown', onKeyDown );
		window.addEventListener( 'message', onMessage );
	},

	closeInteractionsEditor() {
		window.removeEventListener( 'message', this.onMessage );
		window.removeEventListener( 'keydown', this.onKeyDown );

		if ( this.activeOverlay ) {
			this.activeOverlay.remove();
		}

		this.activeOverlay = null;
		this.activeIframe = null;
		this.onMessage = null;
		this.onKeyDown = null;
	},
} );

const interactionsPoc = new InteractionsPoc();

function registerTopBarButton() {
	if ( ! window?.elementorV2?.editorAppBar ) {
		return;
	}

	EditorAppBar.utilitiesMenu.registerAction( {
		id: 'interactions-poc-open',
		priority: 50,
		useProps: () => ( {
			title: 'Interactions Editor',
			icon: PlayerPlayIcon,
			onClick: () => interactionsPoc.openInteractionsEditor(),
		} ),
	} );
}

registerTopBarButton();
