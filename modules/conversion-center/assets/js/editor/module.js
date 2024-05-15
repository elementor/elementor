import Component from './component';

class LinksPageLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );

		window.top.addEventListener( 'elementor/routes/close', this.redirectToAdminPage.bind( this ) );
	}

	redirectToAdminPage( event ) {
		switch ( event.detail.route ) {
			case 'library/templates/contact-buttons':
				if ( elementor.config?.admin_conversion_center_contact_url && this.isContactDocument() ) {
					window.location.href = elementor.config.admin_conversion_center_contact_url;
				}
				break;
			case 'library/templates/links-pages':
				if ( elementor.config?.admin_conversion_center_links_url && this.isLinksDocument() ) {
					window.location.href = elementor.config.admin_conversion_center_links_url;
				}
				break;
			default:
				break;
		}
	}

	onElementorInit() {
		elementor.hooks.addFilter( 'elements/base/behaviors', ( behaviors ) => {
			if ( this.isLinksDocument() || this.isContactDocument() ) {
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

	isLinksDocument() {
		return 'links-page' === elementor.config.document.type;
	}

	isContactDocument() {
		return 'contact-buttons' === elementor.config.document.type;
	}
}

export default LinksPageLibraryModule;
