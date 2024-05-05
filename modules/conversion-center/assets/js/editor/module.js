import Component from './component';

class LinksPageLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );
	}

	onElementorInit() {
		elementor.hooks.addFilter( `elements/base/button/remove/action`, function( action ) {
			if ( 'links-page' === elementor.config.document.type ) {
				return 'library/open';
			}
			return action;
		} );

		elementor.hooks.addFilter( 'elements/base/behaviors', function( behaviors ) {
			if ( 'links-page' === elementor.config.document.type ) {
				const { contextMenu: { groups } } = behaviors;
				const editedGroups = groups.map( ( group ) => {
					const enabledCommands = [ 'edit', 'delete' ];
					const { name, actions } = group;
					return {
						name,
						actions: actions.filter( ( action ) => enabledCommands.includes( action.name ) ),
					};
				} ).filter( ( group ) => group.actions.length );
				behaviors.contextMenu.groups = editedGroups;
			}
			return behaviors;
		} );
	}
}

export default LinksPageLibraryModule;
