import After from 'elementor-api/modules/hooks/data/after';

export class KitAfterSave extends After {
	getCommand() {
		return 'document/save/save';
	}

	getConditions( args ) {
		const { status, document = elementor.documents.getCurrent() } = args;
		return 'publish' === status && 'kit' === document.config.type;
	}

	getId() {
		return 'kit-footer-saver-after-save';
	}

	apply( args ) {
		if ( 'publish' === args.status ) {
			elementor.notifications.showToast( {
				message: elementor.translate( 'kit_changes_updated' ),
				buttons: [
					{
						name: 'back_to_editor',
						text: elementor.translate( 'back_to_editor' ),
						callback() {
							$e.run( 'panel/global/close' );
						},
					},
				],
			} );
		}
	}
}

export default KitAfterSave;
