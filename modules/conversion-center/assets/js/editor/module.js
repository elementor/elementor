import Component from './component';

class LinksPageLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );
	}

	onElementorInit() {
		elementor.hooks.addFilter( 'elements/base/behaviors', ( behaviors ) => {
			if ( this.isContactDocument() ) {
				const { contextMenu: { groups } } = behaviors;
				behaviors.contextMenu.groups = groups
					.map( this.filterOutUnsupportedActions() )
					.filter( ( group ) => group.actions.length );
			}
			return behaviors;
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

	isContactDocument() {
		return 'contact-buttons' === elementor.config.document.type;
	}
}

export default LinksPageLibraryModule;
