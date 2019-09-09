import Base from '../../commands/base';

export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
		this.requireArgument( 'width', args );
	}

	getHistory( args ) {
		return false; // Manual history.
	}

	apply( args ) {
		const { containers = [ args.container ], width, options = {} } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			this.resizeColumn( container, width, options.lazy );
		} );
	}

	getColumnPercentSize( element, size ) {
		return +( size / element.parent().width() * 100 ).toFixed( 3 );
	}

	getPreviousColumn( container ) {
		// TODO: should be container.parent.children
		const collection = container.parent.view.collection;

		return container.parent.view.getColumnAt( collection.indexOf( container.model ) - 1 );
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

	resizeColumn( container, newSize, lazy = false ) {
		const currentSize = +container.view.model.getSetting( '_inline_size' ) || this.getColumnPercentSize( container.view.$el, container.view.$el.width() ),
			neighborView = container.parent.view.getNextColumn( container.view ) || this.getPreviousColumn( container );

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
				lazy,
				external: true,
				history: {
					elementType: 'column',
					title: elementor.config.elements.column.controls._inline_size.label,
				},
			},
		} );
	}
}
