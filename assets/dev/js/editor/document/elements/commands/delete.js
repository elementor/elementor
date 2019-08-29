import Base from './base';

// Delete.
export default class extends Base {
	static restore( historyItem, isRedo ) {
		const elements = historyItem.get( 'elements' );

		if ( isRedo ) {
			elements.forEach( ( element ) => {
				$e.run( 'document/elements/delete', { element: element.lookup() } );
			} );
		} else {
			const subItems = historyItem.collection;

			elements.forEach( ( element ) => {
				const data = subItems.findWhere( { element } ).get( 'data' );

				$e.run( 'document/elements/create', {
					element: data.parent,
					model: data.model,
					options: {
						at: data.at,
					},
				} );
			} );
		}
	}

	validateArgs( args ) {
		this.requireElements( args );
	}

	getHistory( args ) {
		const { elements = [ args.element ] } = args;

		return {
			elements,
			type: 'remove',
			history: {
				behavior: {
					restore: this.constructor.restore,
				},
			},
		};
	}

	apply( args ) {
		const { elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const parent = element._parent;

			if ( this.isHistoryActive() ) {
				$e.run( 'document/history/addSubItem', {
					element,
					data: {
						model: elementorCommon.helpers.cloneObject( element.model ),
						parent: element._parent,
						at: element._index,
					},
				} );
			}

			element.model.destroy();

			if ( parent && parent.model && 'section' === parent.model.get( 'elType' ) ) {
				if ( 0 === parent.collection.length && this.isHistoryActive() ) {
					parent.handleEmptySection();
				} else if ( parent.collection.length ) {
					parent.resetLayout();
				}
			}
		} );
	}
}
