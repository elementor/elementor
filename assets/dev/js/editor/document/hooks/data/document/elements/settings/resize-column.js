import After from 'elementor-api/modules/hooks/data/after';

export class ResizeColumn extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'resize-column';
	}

	getContainerType() {
		return 'column';
	}

	getConditions( args ) {
		return args.settings._inline_size;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /**Container*/ container ) => {
			this.resizeColumn( container, args.settings._inline_size );
		} );

		return true;
	}

	resizeColumn( container, newSize ) {
		const nextContainer = container.parent.view.getNeighborContainer( container );

		if ( ! nextContainer ) {
			return false;
		}

		const parentView = container.parent.view,
			currentColumnView = container.view;

		let currentSize = null;

		if ( undefined === container.oldValues || null === container.oldValues._inline_size ) {
			// Mean, that it was not set before ( first time ).
			currentSize = container.settings.get( '_column_size' );
		} else {
			const totalWidth = parentView.$el.find( ' > .elementor-container' )[ 0 ].getBoundingClientRect().width;
			currentSize = +( container.oldValues._inline_size ||
				( currentColumnView.el.getBoundingClientRect().width / totalWidth * 100 ) );
		}

		const nextChildView = nextContainer.view,
			$nextElement = nextChildView.$el,
			nextElementCurrentSize = +nextChildView.model.getSetting( '_inline_size' ) ||
				container.parent.view.getColumnPercentSize( $nextElement, $nextElement[ 0 ].getBoundingClientRect().width ),
			nextElementNewSize = +( currentSize + nextElementCurrentSize - newSize ).toFixed( 3 );

		/**
		 * TODO: Hook prevented ( next command will not call recursive hook ), but we didnt tell the hook to be prevented
		 * consider: '$e.hooks.preventRecursive()'.
		 */
		$e.run( 'document/elements/settings', {
			containers: [ nextContainer ],
			settings: {
				_inline_size: nextElementNewSize,
			},
			options: {
				callbacks: {
					'resize-column-limit': false,
				},
				history: {
					title: elementor.config.elements.column.controls._inline_size.label,
				},
				external: true,
				debounce: true,
			},
		} );

		return true;
	}
}

export default ResizeColumn;
