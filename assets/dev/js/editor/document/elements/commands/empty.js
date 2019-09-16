import Base from '../../commands/base';

export default class extends Base {
	static restore( historyItem, isRedo ) {
		if ( isRedo ) {
			$e.run( 'document/elements/empty', { force: true } );
		} else {
			elementor.getPreviewView().addChildModel( historyItem.get( 'data' ) );
		}
	}

	getHistory( args ) {
		if ( args.force ) {
			return {
				type: 'remove',
				elementType: 'section',
				title: elementor.translate( 'all_content' ),
				data: elementor.elements.toJSON(),
				restore: this.constructor.restore,
			};
		}

		return false;
	}

	apply( args ) {
		if ( args.force ) {
			elementor.elements.reset();
			elementor.getPreviewContainer().panel.closeEditor();
			return;
		}

		elementor.getClearPageDialog().show();
	}
}
