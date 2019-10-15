import HookAfter from '../base/after';
import Container from '../../../container/container';

export class ResizeColumn extends HookAfter {
	hook() {
		return 'document/elements/settings';
	}

	id() {
		return 'resize-column';
	}

	conditioning( args ) {
		return ! args.settings._inline_size || args.isMultiSettings;
	}

	apply( args ) {
		const { containers = [ args.container ], options = {} } = args;

		if ( ! options.debounceHistory ) {
			options.debounceHistory = false;
		}

		containers.forEach( ( /**Container*/ container ) => {
			const parentView = container.parent.view,
				columnView = container.view,
				currentSize = container.settings._previousAttributes._inline_size ||
					container.settings._previousAttributes._column_size,
				newSize = args.settings._inline_size;

			parentView.resizeColumn( columnView, currentSize, newSize, false, options.debounceHistory );
		} );

		return true;
	}
}

export default ResizeColumn;
