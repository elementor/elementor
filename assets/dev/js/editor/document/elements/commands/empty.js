import CommandHistory from 'elementor-document/commands/base/command-history';

export class Empty extends CommandHistory {
	static restore( historyItem, isRedo ) {
		if ( isRedo ) {
			$e.run( 'document/elements/empty', { force: true } );
		} else {
			const data = historyItem.get( 'data' );

			if ( data ) {
				elementor.getPreviewView().addChildModel( data );
			}

			$e.internal( 'document/save/set-is-modified', { status: true } );
		}
	}

	getHistory( args ) {
		if ( args.force ) {
			return {
				type: 'remove',
				title: __( 'All Content', 'elementor' ),
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

	isDataChanged() {
		if ( this.args.force ) {
			return true;
		}
	}
}

export default Empty;
