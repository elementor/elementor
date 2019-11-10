import HookAfter from '../base/after';
import Debounce from '../../commands/base/debounce';

export class ResizeColumn extends HookAfter {
	hook() {
		return 'document/elements/settings';
	}

	id() {
		return 'resize-column';
	}

	conditions( args ) {
		return args.settings._inline_size && ! args.isMultiSettings;
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args;

		if ( ! options.debounceHistory ) {
			options.debounceHistory = false;
		}

		containers.forEach( ( /**Container*/ container ) => {
			const parentView = container.parent.view,
				columnView = container.view,
				changes = Debounce.getChanges( args )[ container.id ],
				currentSize = changes.old._inline_size || container.settings.get( '_column_size' ),
				newSize = changes.new._inline_size;

			this.resizeColumn( container, currentSize, newSize );
		} );

		return true;
	}

	resizeColumn( container, currentSize, newSize ) {
		const parentView = container.parent.view,
			childView = container.view,
			nextChildView = parentView.getNextColumn( childView ) || parentView.getPreviousColumn( childView );

		if ( ! nextChildView ) {
			return false;
		}

		const $nextElement = nextChildView.$el,
			nextElementCurrentSize = +nextChildView.model.getSetting( '_inline_size' ) || nextChildView.model.getSetting( '_column_size' ),
			nextElementNewSize = +( currentSize + nextElementCurrentSize - newSize ).toFixed( 3 ),
			nextColumnContainer = nextChildView.getContainer(),
			containers = [ nextColumnContainer ],
			settings = {
				[ nextColumnContainer.id ]: {
					_inline_size: nextElementNewSize,
				},
			};

		$e.run( 'document/elements/settings', {
			containers,
			settings,
			isMultiSettings: true,
			options: {
				debounceHistory: true,
				external: true,
				history: {
					title: elementor.config.elements.column.controls._inline_size.label,
				},
			},
		} );

		return true;
	}
}

export default ResizeColumn;
