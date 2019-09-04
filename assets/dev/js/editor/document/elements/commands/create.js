import Base from './base';

// Create.
export default class Create extends Base {
	static restore( historyItem, isRedo ) {
		const containers = historyItem.get( 'containers' ),
			options = historyItem.get( 'options' ) || {},
			subItems = historyItem.collection;

		// No clone when restoring, eg: duplicate will generate unique ids while restoring.
		if ( options.clone ) {
			options.clone = false;
		}

		containers.forEach( ( container ) => {
			const data = subItems.findWhere( { container } ).get( 'data' );

			if ( isRedo ) {
				const model = historyItem.get( 'model' ),
					{ toRestoreModel } = data;

				$e.run( 'document/elements/create', {
					container,
					model: toRestoreModel,
					options,
				} );
			} else {
				$e.run( 'document/elements/delete', { container: data.toRestoreContainer } );
			}
		} );
	}

	validateArgs( args ) {
		this.requireContainer( args );
		this.requireArgumentConstructor( 'model', Object, args );
	}

	getHistory( args ) {
		const { model, options, containers = [ args.container ] } = args;

		return {
			containers,
			model,
			options,
			type: 'add',
			history: {
				behavior: {
					restore: this.constructor.restore,
				},
			},
		};
	}

	apply( args ) {
		const { model, options = {}, containers = [ args.container ] } = args;

		let result = [];

		containers.forEach( ( container ) => {
			container = container.lookup();

			const createdContainer = container.view.addChildElement( model, options ).getContainer();

			// Create column for inner section (Moved from elements/views/base.js).
			if ( this.isHistoryActive() && 'section' === createdContainer.model.get( 'elType' ) && createdContainer.model.get( 'isInner' ) ) {
				createdContainer.view.handleCreateInnerSection();
			}

			result.push( createdContainer );

			if ( this.isHistoryActive() ) {
				$e.run( 'document/history/addSubItem', {
					container,
					data: {
						toRestoreContainer: createdContainer,
						toRestoreModel: createdContainer.model.toJSON(),
					},
				} );
			}
		} );

		if ( 1 === result.length ) {
			result = result[ 0 ];
		}

		return result;
	}
}
