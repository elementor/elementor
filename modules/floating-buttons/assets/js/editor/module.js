import Component from './component';

class FloatingButtonsLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );
		elementor.channels.editor.on( 'section:activated', this.hideAdvancedTab.bind( this ) );
	}

	hideAdvancedTab( sectionName, editor ) {
		const widgetType = editor?.model?.get( 'widgetType' ) || '';

		if ( ! widgetType.startsWith( 'contact-buttons' ) ) {
			return;
		}

		const advancedTab = editor?.el.querySelector( '.elementor-tab-control-advanced' ) || false;

		if ( advancedTab ) {
			advancedTab.style.display = 'none';
		}
	}

	onElementorInit() {
		elementor.hooks.addFilter( 'elements/base/behaviors', ( behaviors ) => {
			if ( this.isFloatingButtonDocument() ) {
				const { contextMenu: { groups } } = behaviors;
				behaviors.contextMenu.groups = groups
					.map( this.filterOutUnsupportedActions() )
					.filter( ( group ) => group.actions.length );
			}
			return behaviors;
		}, 1000 );

		elementor.hooks.addFilter( 'elementor/editor/template-library/template/promotion-link', ( url, templateData ) => {
			const { type } = templateData;
			if ( 'floating_button' === type ) {
				try {
					const urlPieces = new URL( url );
					const searchParams = new URLSearchParams();
					urlPieces.searchParams.forEach( ( value, key ) => {
						if ( 'utm_source' === key ) {
							searchParams.set( key, 'template-library-floating-buttons' );
						} else {
							searchParams.set( key, value );
						}
					} );
					return `${ urlPieces.origin }${ urlPieces.pathname }?${ searchParams.toString() }`;
				} catch ( e ) {
					return url;
				}
			}
			return url;
		}, 1000 );
	}

	filterOutUnsupportedActions() {
		return ( group ) => {
			const enabledCommands = [ 'edit', 'delete', 'resetStyle', 'save' ];
			const { name, actions } = group;
			return {
				name,
				actions: actions.filter( ( action ) => enabledCommands.includes( action.name ) ),
			};
		};
	}

	isFloatingButtonDocument() {
		return 'floating-buttons' === elementor.config.document.type;
	}
}

export default FloatingButtonsLibraryModule;
