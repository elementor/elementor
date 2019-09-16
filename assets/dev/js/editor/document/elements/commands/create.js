import Base from '../../commands/base';

// Create.
export default class Create extends Base {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' ),
			container = historyItem.get( 'container' ),
			options = historyItem.get( 'options' ) || {};

		// No clone when restoring, eg: duplicate will generate unique ids while restoring.
		if ( options.clone ) {
			options.clone = false;
		}

		if ( isRedo ) {
			$e.run( 'document/elements/create', {
				container,
				model: data.toRestoreModel,
				options,
			} );
		} else {
			$e.run( 'document/elements/delete', { container: data.toRestoreContainer } );
		}
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
			type: 'add',
			title: elementor.history.history.getModelLabel( model ),
			elementType: model.elType,
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
					type: 'sub-add',
					elementType: createdContainer.model.get( 'elType' ),
					restore: this.constructor.restore,
					options,
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
