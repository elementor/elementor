const APP_URL = 'http://localhost:5173/';
const INTERACTIONS_SETTING_KEY = 'interactions';
const ELEMENT_TYPES = [ 'widget', 'container', 'section', 'column' ];

const InteractionsPoc = elementorModules.editor.utils.Module.extend( {
	onElementorInit() {
		ELEMENT_TYPES.forEach( ( elementType ) => {
			elementor.hooks.addFilter(
				`elements/${ elementType }/contextMenuGroups`,
				( groups, view ) => this.addContextMenuItem( groups, view ),
			);
		} );
	},

	addContextMenuItem( groups, view ) {
		groups.unshift( {
			name: 'interactions-poc',
			actions: [
				{
					name: 'open-interactions-editor',
					title: 'Open Interactions Editor',
					callback: () => this.openInteractionsEditor( view.getContainer() ),
				},
			],
		} );

		return groups;
	},

	openInteractionsEditor( container ) {
		if ( this.activeIframe ) {
			return;
		}

		const iframe = document.createElement( 'iframe' );
		iframe.src = APP_URL;
		iframe.title = 'Interactions Editor';
		iframe.style.cssText = 'position:fixed;inset:0;z-index:999999;width:100%;height:100%;border:0;background:#fff';
		document.body.appendChild( iframe );
		this.activeIframe = iframe;

		const onMessage = ( event ) => {
			const { type } = event.data || {};

			if ( 'ready' === type ) {
				iframe.contentWindow.postMessage( {
					type: 'init',
					element: this.buildElementContext( container ),
				}, '*' );
				return;
			}

			if ( 'save' === type ) {
				$e.run( 'document/elements/settings', {
					container,
					settings: {
						[ INTERACTIONS_SETTING_KEY ]: event.data.interactions,
					},
				} );
				iframe.contentWindow.postMessage( { type: 'saved', ok: true }, '*' );
				this.closeInteractionsEditor();
				return;
			}

			if ( 'close' === type ) {
				this.closeInteractionsEditor();
			}
		};

		this.onMessage = onMessage;
		window.addEventListener( 'message', onMessage );
	},

	buildElementContext( container ) {
		const settings = container.settings.toJSON();

		return {
			id: container.id,
			widgetType: container.model.get( 'widgetType' ) || container.model.get( 'elType' ),
			interactions: settings[ INTERACTIONS_SETTING_KEY ] || null,
		};
	},

	closeInteractionsEditor() {
		window.removeEventListener( 'message', this.onMessage );

		if ( this.activeIframe ) {
			this.activeIframe.remove();
		}

		this.activeIframe = null;
		this.onMessage = null;
	},
} );

new InteractionsPoc();
