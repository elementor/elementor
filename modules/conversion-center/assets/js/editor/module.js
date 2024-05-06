import Component from './component';

class LinksPageLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );
	}

	onElementorInit() {
		elementor.hooks.addFilter( `elements/base/button/remove/action`, ( action ) => {
			if ( this.isLinksDocument() ) {
				return 'library/open';
			}
			return action;
		} );

		elementor.hooks.addFilter( 'elements/base/behaviors', ( behaviors ) => {
			if ( this.isLinksDocument() ) {
				const { contextMenu: { groups } } = behaviors;
				behaviors.contextMenu.groups = groups.map( ( group ) => {
					const enabledCommands = [ 'edit', 'delete', 'resetStyle', 'save' ];
					const { name, actions } = group;
					return {
						name,
						actions: actions.filter( ( action ) => enabledCommands.includes( action.name ) ),
					};
				} ).filter( ( group ) => group.actions.length );
			}
			return behaviors;
		}, 1000 );

		elementor.hooks.addFilter( 'elements/container/edit-buttons', ( editTools ) => {
			if ( this.isLinksDocument() ) {
				return {
					remove: editTools.remove,
				};
			}
			return editTools;
		} );
	}

	isLinksDocument() {
		return 'links-page' === elementor.config.document.type;
	}
}

export default LinksPageLibraryModule;
