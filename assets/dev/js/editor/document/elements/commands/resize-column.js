import Base from '../../commands/base';

export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
		this.requireArgument( 'width', args );

		// TODO: validate containers is columns.
	}

	getHistory( args ) {
		return false; // Manual history.
	}

	apply( args ) {
		const { containers = [ args.container ], width } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			this.resizeColumn( container, width );
		} );
	}

	getColumnPercentSize( element, size ) {
		return +( size / element.parent().width() * 100 ).toFixed( 3 );
	}

	getColumnAt( container, index ) {
		// TODO: should be container.parent.children
		const collection = container.parent.view.collection,
			model = collection.at( index );

		return model ? container.parent.view.children.findByModelCid( model.cid ) : null;
	}

	getPreviousColumn( container ) {
		// TODO: should be container.parent.children
		const collection = container.parent.view.collection;

		return this.getColumnAt( container, collection.indexOf( container.model ) - 1 );
	}

	getNextColumn( container ) {
		// TODO: should be container.parent.children
		const collection = container.parent.view.collection;

		return this.getColumnAt( container, collection.indexOf( container.model ) + 1 );
	}

	getNeighborSize( container, sourceCurrentSize, sourceNewSize ) {
		const minColumnSize = 2, // TODO: not the right place.
			nextChildView = container.view,
			$nextElement = nextChildView.$el,
			nextElementCurrentSize = +nextChildView.model.getSetting( '_inline_size' ) || this.getColumnPercentSize( $nextElement, $nextElement[ 0 ].getBoundingClientRect().width ),
			nextElementNewSize = +( sourceCurrentSize + nextElementCurrentSize - sourceNewSize ).toFixed( 3 );

		if ( nextElementNewSize < minColumnSize ) {
			throw new RangeError( this.errors.columnWidthTooLarge );
		}

		if ( sourceNewSize < minColumnSize ) {
			throw new RangeError( this.errors.columnWidthTooSmall );
		}

		return nextElementNewSize;
	}

	resizeColumn( container, newSize ) {
		const currentSize = +container.view.model.getSetting( '_inline_size' ) || this.getColumnPercentSize( container.view.$el, container.view.$el.width() ),
			neighborView = this.getNextColumn( container ) || this.getPreviousColumn( container );

		if ( ! neighborView ) {
			throw new ReferenceError( 'There is not enough columns' );
		}

		const nextElementNewSize = this.getNeighborSize( neighborView.getContainer(), currentSize, newSize ),
			neighborContainer = neighborView.getContainer();

		$e.run( 'document/elements/settings', {
			// `neighborContainer` must be first.
			containers: [ neighborContainer, container ],
			settings: {
				[ neighborContainer.id ]: {
					_inline_size: nextElementNewSize,
				},
				[ container.id ]: {
					_inline_size: newSize,
				},
			},
			isMultiSettings: true,
			options: {
				external: true,
				lazy: true,
				history: {
					title: elementor.config.elements.column.controls._inline_size.label,
				},
			},
		} );
	}
}
