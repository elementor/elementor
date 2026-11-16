const EDITABLE_SELECTOR = [
	'input:not([type="hidden"]):not([disabled])',
	'textarea:not([disabled])',
	'select:not([disabled])',
	'[contenteditable="true"]',
].join( ', ' );

const MONACO_SELECTOR = '.monaco-editor';

const ESCAPE_OWNER_SELECTOR = [
	'.dialog-widget',
	'[role="dialog"]',
	'.MuiModal-root',
	'.MuiPopover-root',
	'.MuiAutocomplete-popper',
	'.select2-container--open',
].join( ', ' );

const CONTROL_ANCHOR_SELECTOR = '.elementor-control, [data-type="settings-field"], [role="group"]';

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join( ', ' );

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

/**
 * @param {HTMLElement|Element|null} element
 * @return {boolean} Whether the element accepts typed input.
 */
export function isEditableTarget( element ) {
	if ( ! element || 'function' !== typeof element.matches ) {
		return false;
	}

	return element.matches( EDITABLE_SELECTOR ) || !! element.closest( MONACO_SELECTOR );
}

/**
 * @param {HTMLElement|Element|null} element
 * @return {boolean} Whether the element lives inside an overlay that handles Escape on its own.
 */
export function isInsideOverlay( element ) {
	if ( ! element || 'function' !== typeof element.closest ) {
		return false;
	}

	return !! element.closest( ESCAPE_OWNER_SELECTOR );
}

/**
 * @param {HTMLElement|null} anchor
 * @return {HTMLElement|null} The nearest ancestor-or-self that generates a box, so `focus()` applies.
 */
function getRenderedAnchor( anchor ) {
	let candidate = anchor;

	while ( candidate && 'contents' === candidate.ownerDocument.defaultView?.getComputedStyle( candidate ).display ) {
		candidate = candidate.firstElementChild;
	}

	return candidate;
}

/**
 * @param {HTMLElement} field
 * @return {HTMLElement|null} The control wrapper, or the closest usable ancestor.
 */
export function getEscapeAnchor( field ) {
	const monacoRoot = field.closest( MONACO_SELECTOR );
	const anchor = field.closest( CONTROL_ANCHOR_SELECTOR ) ||
		( monacoRoot ? monacoRoot.parentElement : field.parentElement );

	return getRenderedAnchor( anchor );
}

/**
 * @param {HTMLElement} element
 * @param {HTMLElement} root
 * @return {HTMLElement|null} The next focusable element outside the element's subtree.
 */
export function findNextFocusableAfter( element, root ) {
	const walker = root.ownerDocument.createTreeWalker( root, NodeFilter.SHOW_ELEMENT );

	walker.currentNode = element;

	let node = walker.nextNode();

	while ( node ) {
		if ( ! element.contains( node ) && node.matches( FOCUSABLE_SELECTOR ) ) {
			return node;
		}

		node = walker.nextNode();
	}

	return null;
}

/**
 * Focusing an ancestor puts the sequential focus starting point *before* its descendants, so a plain
 * Tab would walk back into the field that was just escaped. A one-shot handler skips past the subtree.
 *
 * @param {HTMLElement} anchor
 * @param {HTMLElement} root
 */
function parkFocusOnAnchor( anchor, root ) {
	const hadTabIndex = anchor.hasAttribute( 'tabindex' );

	if ( ! hadTabIndex ) {
		anchor.setAttribute( 'tabindex', '-1' );
	}

	anchor.focus( { preventScroll: true } );

	if ( anchor.ownerDocument.activeElement !== anchor ) {
		if ( ! hadTabIndex ) {
			anchor.removeAttribute( 'tabindex' );
		}

		return;
	}

	const onKeyDown = ( event ) => {
		if ( 'Tab' !== event.key || event.shiftKey || event.defaultPrevented || event.target !== anchor ) {
			return;
		}

		const next = findNextFocusableAfter( anchor, root );

		if ( ! next ) {
			return;
		}

		event.preventDefault();
		next.focus();
	};

	const onFocusOut = ( event ) => {
		if ( event.relatedTarget && anchor.contains( event.relatedTarget ) ) {
			return;
		}

		anchor.removeEventListener( 'keydown', onKeyDown );
		anchor.removeEventListener( 'focusout', onFocusOut );

		if ( ! hadTabIndex ) {
			anchor.removeAttribute( 'tabindex' );
		}
	};

	anchor.addEventListener( 'keydown', onKeyDown );
	anchor.addEventListener( 'focusout', onFocusOut );
}

/**
 * Releases focus from an editable panel field on Escape, instead of letting the global `esc` shortcut
 * route away to the menu. A second Escape is left unhandled, so it exits the panel as usual.
 *
 * @param {KeyboardEvent|jQuery.Event} event
 * @param {HTMLElement}                root  - Panel element the event was delegated from. `#elementor-panel-inner`
 *                                           hosts the V4 panel portal too, so this covers V1 and V4 controls alike.
 * @return {boolean} Whether the event was handled.
 */
export function escapeFromPanelField( event, root ) {
	const isDefaultPrevented = 'function' === typeof event.isDefaultPrevented
		? event.isDefaultPrevented()
		: event.defaultPrevented;

	if ( 'Escape' !== event.key || isDefaultPrevented ) {
		return false;
	}

	const field = root.ownerDocument.activeElement;

	if ( ! isEditableTarget( field ) || ! root.contains( field ) || isInsideOverlay( field ) ) {
		return false;
	}

	event.preventDefault();
	event.stopPropagation();

	const anchor = getEscapeAnchor( field );

	field.blur();

	if ( anchor ) {
		parkFocusOnAnchor( anchor, root );
	}

	return true;
}
