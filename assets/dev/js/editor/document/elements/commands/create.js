import Base from './base';

// Create.
export default class Create extends Base {
	static restore( historyItem, isRedo ) {
		const elements = historyItem.get( 'elements' ),
			options = historyItem.get( 'options' ) || {},
			subItems = historyItem.collection;

		// No clone when restoring, eg: duplicate will generate unique ids while restoring.
		if ( options.clone ) {
			options.clone = false;
		}

		elements.forEach( ( element ) => {
			const data = subItems.findWhere( { element } ).get( 'data' );

			if ( isRedo ) {
				const model = historyItem.get( 'model' ),
					{ toRestoreModel } = data;

				element = element.lookup();

				$e.run( 'document/elements/create', {
					element,
					model: toRestoreModel,
					options,
				} );
			} else {
				$e.run( 'document/elements/delete', { element: data.toRestoreElement.lookup() } );
			}
		} );
	}

	validateArgs( args ) {
		this.requireElements( args );
		this.requireArgument( 'model', args );
	}

	getHistory( args ) {
		const { model, options, elements = [ args.element ] } = args;

		return {
			elements,
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
		const { model, options = {}, elements = [ args.element ] } = args;

		let result = [];

		elements.forEach( ( element ) => {
			const createdElement = element.addChildElement( model, options );

			// Create column for inner section (Moved from elements/views/base.js).
			if ( this.isHistoryActive() && 'section' === createdElement.getElementType() && createdElement.isInner() ) {
				createdElement.handleCreateInnerSection();
			}

			result.push( createdElement );

			if ( this.isHistoryActive() ) {
				$e.run( 'document/history/addSubItem', {
					element,
					data: {
						toRestoreElement: createdElement,
						toRestoreModel: elementorCommon.helpers.cloneObject( createdElement.model ),
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
