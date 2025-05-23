import { addElementToDocumentState } from 'elementor-document/elements/utils';

export class Create extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' ),
			container = historyItem.get( 'container' ),
			options = historyItem.get( 'options' ) || {};

		// No clone when restoring. e.g: duplicate will generate unique ids while restoring.
		if ( options.clone ) {
			options.clone = false;
		}

		if ( isRedo ) {
			$e.run( 'document/elements/create', {
				container,
				model: data.modelToRestore,
				options,
			} );
		} else {
			$e.run( 'document/elements/delete', { container: data.containerToRestore } );
		}
	}

	validateArgs( args ) {
		this.requireContainer( args );

		// Avoid Backbone model & etc.
		this.requireArgumentConstructor( 'model', Object, args );
	}

	getHistory( args ) {
		const { model, containers = [ args.container ] } = args;

		return {
			containers,
			model,
			type: 'add',
			title: elementor.helpers.getModelLabel( model ),
		};
	}

	apply( args ) {
		const { model, options = {}, containers = [ args.container ] } = args;

		let result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			const createdContainer = container.view.addElement( model, options ).getContainer();

			result.push( createdContainer );

			/**
			 * Acknowledge history of each created item, because we cannot pass the elements when they do not exist
			 * in getHistory().
			 */
			if ( this.isHistoryActive() ) {
				$e.internal( 'document/history/log-sub-item', {
					container,
					type: 'sub-add',
					restore: this.constructor.restore,
					options,
					data: {
						containerToRestore: createdContainer,
						modelToRestore: createdContainer.model.toJSON(),
					},
				} );
			}

			$e.store.dispatch(
				this.component.store.actions.create( {
					documentId: elementor.documents.getCurrentId(),
					parentId: container.id,
					elements: [ createdContainer.model.toJSON() ],
					index: options.at,
				} ),
			);
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		return result;
	}

	static reducer( state, { payload } ) {
		const { parentId, documentId, elements, index } = payload;

		if ( ! state[ documentId ] ) {
			state[ documentId ] = {
				document: {
					id: 'document',
					elements: [],
				},
			};
		}

		addElementToDocumentState(
			elements,
			state[ documentId ],
			parentId,
			index,
		);
	}
}

export default Create;
