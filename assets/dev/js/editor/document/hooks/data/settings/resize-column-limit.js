import Dependency from 'elementor-api/modules/hooks/data/dependency';
import { DEFAULT_INNER_SECTION_COLUMNS } from 'elementor-elements/views/section';

export class ResizeColumnLimit extends Dependency {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'resize-column-limit';
	}

	getContainerType() {
		return 'column';
	}

	getConditions( args ) {
		return args.settings._inline_size;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		return containers.some( ( /**Container*/ container ) => {
			const parentView = container.parent.view,
				columnView = container.view,
				currentSize = container.settings.get( '_inline_size' ) ||
					container.settings.get( '_column_size' ),
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

			if ( nextElementNewSize < DEFAULT_INNER_SECTION_COLUMNS ) {
				if ( $e.devTools ) {
					$e.devTools.log.error( 'New column width is too large' );
				}
				return false;
			}

			if ( newSize < DEFAULT_INNER_SECTION_COLUMNS ) {
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
