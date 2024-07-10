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

		elementor.hooks.addFilter(
			'elementor/editor/template-library/template/promotion-link-search-params',
			( queryString, templateData ) => {
				const { type } = templateData;
				if ( 'floating_button' === type ) {
					try {
						const searchParams = new URLSearchParams( queryString );

						if ( searchParams.has( 'utm_source' ) ) {
							searchParams.set( 'utm_source', 'template-library-floating-buttons' );
						}

						return searchParams.toString();
					} catch ( e ) {
						return queryString;
					}
				}
				return queryString;
			}, 1000 );
	}

	filterOutUnsupportedActions() {
		return ( group ) => {
			const enabledCommands = elementor.helpers.hasPro()
				? [ 'edit', 'delete', 'resetStyle' ]
				: [ 'edit', 'delete', 'resetStyle', 'save' ];
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
