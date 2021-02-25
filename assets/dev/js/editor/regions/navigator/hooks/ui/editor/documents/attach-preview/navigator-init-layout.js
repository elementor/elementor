import After from 'elementor-api/modules/hooks/ui/after';
import ElementCollection from 'elementor-elements/collections/elements';

export class NavigatorInitLayout extends After {
	static postTypesSupportMultiDocument = [ 'wp-post', 'wp-page' ];

	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'navigator-init-layout--editor/documents/attach-preview';
	}

	getConditions() {
		return elementor.documents.getCurrent().config.panel.has_elements;
	}

	apply() {
		const component = $e.components.get( 'navigator' );

		component.isMultiDocumentSupport = NavigatorInitLayout.postTypesSupportMultiDocument
			.includes( elementor.config.initial_document.type );

		if ( component.isMultiDocumentSupport ) {
			this.initNavigatorLayoutMultiDocument( this.getFrontendOrderedDocuments() );
		} else {
			elementor.navigator.initLayout( elementor.elementsModel );
		}

		if ( elementor.navigator.storage.visible ) {
			$e.route( 'navigator' );
		}
	}

	getFrontendOrderedDocuments() {
		const documents = [];

		Object.entries( elementorFrontend.documentsManager.documents ).forEach( ( [ documentId, document ] ) => {
			const extraSettings = {
				index: -1,
			};

			if ( document.$element.hasClass( 'elementor-location-header' ) ) {
				extraSettings.index = 0;
				extraSettings.docType = 'header';
				extraSettings.icon = 'eicon-header';
				extraSettings.title = __( 'Header' );
			} else if ( Number( documentId ) === elementor.config.initial_document.id ) {
				extraSettings.index = 1;
				extraSettings.icon = 'eicon-post-content'; // TODO: Change to the right one.
				extraSettings.docType = 'content';
				extraSettings.title = __( 'Content' );
			} else if ( document.$element.hasClass( 'elementor-location-footer' ) ) {
				extraSettings.index = 2;
				extraSettings.icon = 'eicon-footer';
				extraSettings.docType = 'footer';
				extraSettings.title = __( 'Footer' );
			}

			if ( extraSettings.index > -1 ) {
				document.setSettings( extraSettings );
				documents.splice( extraSettings.index, 0, document );
			}
		} );

		return documents;
	}

	initNavigatorLayoutMultiDocument( documents ) {
		const documentsModel = new Backbone.Model( { elements: new ElementCollection() } ),
			documentsModelElements = documentsModel.get( 'elements' );

		documents.forEach( ( document ) => {
			const settings = document.getSettings(),
				model = new Backbone.Model( {
					elType: 'document',
					docType: settings.docType,
					settings: new Backbone.Model( settings ),
				} );

			if ( settings.id === elementor.documents.getCurrentId() ) {
				model.set( 'elements', elementor.elementsModel.get( 'elements' ) );
			}

			model.getTitle = () => settings.title;
			model.getIcon = () => settings.icon;

			documentsModelElements.add( model, {
				silent: true,
			} );
		} );

		elementor.navigator.initLayout( documentsModel );
	}
}

export default NavigatorInitLayout;
