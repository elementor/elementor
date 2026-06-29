/**
 * Handles arrow-key roving tabindex navigation within a group.
 *
 * @param {Object}       options
 * @param {jQuery.Event} options.event                      - The keydown event
 * @param {jQuery}       options.$items                     - All navigable items
 * @param {string}       [options.orientation='horizontal'] - 'horizontal' | 'vertical' | 'both'
 * @param {boolean}      [options.wrap=true]                - Wrap at boundaries
 * @param {boolean}      [options.activateOnFocus=false]    - Trigger click on arrow navigation
 * @param {Function}     [options.onActivate]               - Callback when Enter/Space pressed
 * @param {boolean}      [options.homeEnd=true]             - Support Home/End keys
 * @return {boolean} Whether the event was handled
 */
export function rovingTabindex( {
	event,
	$items,
	orientation = 'horizontal',
	wrap = true,
	activateOnFocus = false,
	onActivate,
	homeEnd = true,
} ) {
	// Use event.currentTarget when the event is bound directly to items,
	// fall back to event.target when the event is bound to a container.
	const current = $items.index( event.currentTarget ) !== -1
		? event.currentTarget
		: event.target;
	const currentIndex = $items.index( current );
	let targetIndex = currentIndex;

	const isHorizontal = 'horizontal' === orientation || 'both' === orientation;
	const isVertical = 'vertical' === orientation || 'both' === orientation;

	switch ( event.key ) {
		case 'ArrowLeft':
		case 'ArrowUp':
			if ( ( 'ArrowLeft' === event.key && ! isHorizontal ) ||
				( 'ArrowUp' === event.key && ! isVertical ) ) {
				return false;
			}
			event.preventDefault();
			if ( currentIndex > 0 ) {
				targetIndex = currentIndex - 1;
			} else {
				targetIndex = wrap ? $items.length - 1 : currentIndex;
			}
			break;

		case 'ArrowRight':
		case 'ArrowDown':
			if ( ( 'ArrowRight' === event.key && ! isHorizontal ) ||
				( 'ArrowDown' === event.key && ! isVertical ) ) {
				return false;
			}
			event.preventDefault();
			if ( currentIndex < $items.length - 1 ) {
				targetIndex = currentIndex + 1;
			} else {
				targetIndex = wrap ? 0 : currentIndex;
			}
			break;

		case 'Home':
			if ( ! homeEnd ) {
				return false;
			}
			event.preventDefault();
			targetIndex = 0;
			break;

		case 'End':
			if ( ! homeEnd ) {
				return false;
			}
			event.preventDefault();
			targetIndex = $items.length - 1;
			break;

		case 'Enter':
		case ' ':
			event.preventDefault();
			if ( onActivate ) {
				onActivate( event, $items.eq( currentIndex ) );
			}
			return true;

		default:
			return false;
	}

	if ( targetIndex !== currentIndex ) {
		$items.attr( 'tabindex', '-1' );
		$items.eq( targetIndex ).attr( 'tabindex', '0' ).trigger( 'focus' );

		if ( activateOnFocus ) {
			$items.eq( targetIndex ).trigger( 'click' );
		}
	}

	return true;
}

/**
 * Prevents Escape keydown from propagating to close the modal,
 * and suppresses the subsequent keyup event.
 *
 * @param {KeyboardEvent} event - The keydown event
 */
export function suppressEscapeKeyUp( event ) {
	event.stopPropagation();

	const handler = ( e ) => {
		if ( 'Escape' === e.key ) {
			e.stopImmediatePropagation();
		}
		window.removeEventListener( 'keyup', handler, true );
	};

	window.addEventListener( 'keyup', handler, true );
}
