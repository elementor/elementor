import After from 'elementor-api/modules/hooks/ui/after';

export class NavigatorInitialize extends After {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'navigator-initialize';
	}

	getConditions() {
		return elementor.documents.getCurrent().config.panel.has_elements;
	}

	apply( args ) {
		const { region } = $e.components.get( 'navigator' );

		region.initLayout();

		if ( region.storage.visible ) {
			$e.route( 'navigator' );
		}
	}
}

export default NavigatorInitialize;
