import Base from '../../commands/base';

export default class extends Base {
	static restore( historyItem, isRedo ) {
		if ( isRedo ) {
			$e.run( 'document/elements/empty', { force: true } );
		} else {
			const data = historyItem.get( 'data' );

			if ( data ) {
				elementor.getPreviewView().addChildModel( data );
			}
		}
	}

	getHistory( args ) {
		if ( args.force ) {
			return {
				type: 'remove',
				elementType: 'section',
				title: elementor.translate( 'all_content' ),
				data: elementor.elements ? elementor.elements.toJSON() : null,
				restore: this.constructor.restore,
			};
		}

		return false;
	}

	apply( args ) {
		if ( args.force && elementor.elements ) {
			elementor.elements.reset();
			elementor.getPreviewContainer().panel.closeEditor();
			return;
		}

		elementor.getClearPageDialog().show();
	}
}
