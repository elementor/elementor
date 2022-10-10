export class Empty extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		if ( isRedo ) {
			$e.run( 'document/elements/empty', { force: true } );
		} else {
			const data = historyItem.get( 'data' );

			if ( data ) {
				elementor.getPreviewView().addChildModel( data );

				$e.store.dispatch(
					$e.store.get( 'document/elements' ).actions.populate( {
						documentId: elementor.documents.getCurrentId(),
						elements: structuredClone( data ),
					} ),
				);
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

			$e.store.dispatch(
				this.component.store.actions.empty( {
					documentId: elementor.documents.getCurrentId(),
				} ),
			);

			return;
		}

		elementor.getClearPageDialog().show();
	}

	isDataChanged() {
		return this.args.force;
	}

	static reducer( state, { payload } ) {
		const { documentId } = payload;

		if ( state[ documentId ] ) {
			state[ documentId ] = {
				document: {
					id: 'document',
					elements: [],
				},
			};
		}
	}
}

export default Empty;
