import App from './app';
import { createRoot } from 'react-dom/client';

export class AppManager {
	constructor() {
		this.popover = null;
		this.onRoute = () => {};
		this.unbindIframeEvents = () => {};
	}

	mount( targetNode, selectors ) {
		if ( this.popover ) {
			return;
		}

		const wrapperElement = targetNode?.closest( selectors.wrapperElement );
		const rootElement = wrapperElement?.querySelector( selectors.reactAnchor );

		if ( ! rootElement ) {
			return;
		}

		this.attachEditorEventListeners();

		this.popover = createRoot( rootElement );

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;

		this.popover.render(
			<App
				colorScheme={ colorScheme }
				isRTL={ isRTL }
				onClose={ () => this.unmount() }
			/>,
		);
	}

	unmount() {
		if ( this.popover ) {
			this.detachEditorEventListeners();
			this.popover.unmount();
			this.unbindIframeEvents();
		}

		this.popover = null;
	}

	setupIframeEventListeners() {
		const previewIframe = document.getElementById( 'elementor-preview-iframe' );

		if ( previewIframe ) {
			const iframeDocument = previewIframe.contentWindow.document;
			const handleClick = () => this.unmount();

			iframeDocument.addEventListener( 'click', handleClick );
			iframeDocument.addEventListener( 'keydown', handleClick );

			this.unbindIframeEvents = () => {
				iframeDocument.removeEventListener( 'click', handleClick );
				iframeDocument.removeEventListener( 'keydown', handleClick );
			};
		}
	}

	setupRouteListener() {
		this.onRoute = ( component, route ) => {
			if ( route !== 'panel/elements/categories' && route !== 'panel/editor/content' ) {
				return;
			}
			this.unmount();
		};

		$e.routes.on( 'run:after', this.onRoute );
	}

	attachEditorEventListeners() {
		this.setupIframeEventListeners();
		this.setupRouteListener();
	}

	detachEditorEventListeners() {
		$e.routes.off( 'run:after', this.onRoute );
	}
}
