import HookDependency from '../../../hooks/dependency';
import Container from '../../../../container/container';

export class ResizeColumnLimit extends HookDependency {
	hook() {
		return 'document/elements/settings';
	}

	id() {
		return 'resize-column-limit';
	}

	conditioning( args ) {
		return ! args.settings._inline_size || args.isMultiSettings;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /**Container*/ container ) => {
			const parentView = container.parent.view,
				columnView = container.view,
				currentSize = container.settings._previousAttributes._inline_size ||
					container.settings._previousAttributes._column_size,
				newSize = args.settings._inline_size,
				nextChildView = parentView.getNextColumn( columnView ) || parentView.getPreviousColumn( columnView );

			if ( ! nextChildView ) {
				if ( $e.devTools ) {
					$e.devTools.log.error( 'There is not any next column' );
				}
				return false;
			}

			const $nextElement = nextChildView.$el,
				nextElementCurrentSize = +nextChildView.model.getSetting( '_inline_size' ) ||
					parentView.getColumnPercentSize( $nextElement, $nextElement[ 0 ].getBoundingClientRect().width ),
				nextElementNewSize = +( currentSize + nextElementCurrentSize - newSize ).toFixed( 3 );

			if ( nextElementNewSize < parentView.defaultMinColumnSize ) {
				if ( $e.devTools ) {
					$e.devTools.log.error( 'New column width is too large' );
				}
				return false;
			}

			if ( newSize < parentView.defaultMinColumnSize ) {
				if ( $e.devTools ) {
					$e.devTools.log.error( 'New column width is too small' );
				}
				return false;
			}

			return true;
		} );
	}
}

export default ResizeColumnLimit;
