/**
 * HTML5 - Drag and Drop
 *
 * @param {jQuery} $
 */
( function( $ ) {
	var hasFullDataTransferSupport = function( event ) {
		try {
			event.originalEvent.dataTransfer.setData( 'test', 'test' );

			event.originalEvent.dataTransfer.clearData( 'test' );

			return true;
		} catch ( e ) {
			return false;
		}
	};

	// A droppable can place its placeholder outside itself (see `getPlaceholderOverride`),
	// where the per-droppable cleanup can't reach it. Only one such placeholder should ever
	// be visible, so it's tracked across droppables and cleared by whoever draws next.
	var overridePlaceholder = null;

	var clearOverridePlaceholder = function() {
		if ( ! overridePlaceholder ) {
			return;
		}

		overridePlaceholder.$placeholder.removeClass( overridePlaceholder.className ).remove();

		overridePlaceholder = null;
	};

	// `dragleave` on the droppable being left can fire after `dragenter` on the one being
	// entered, so a droppable may only clean up a placeholder it owns.
	var clearOwnOverridePlaceholder = function( $placeholder ) {
		if ( overridePlaceholder?.$placeholder.is( $placeholder ) ) {
			clearOverridePlaceholder();
		}
	};

	var setOverridePlaceholder = function( $placeholder, override ) {
		const insertMethod = 'bottom' === override.side ? 'after' : 'before';

		$placeholder.addClass( override.className );

		$( override.element )[ insertMethod ]( $placeholder );

		overridePlaceholder = { $placeholder, className: override.className };
	};

	var Draggable = function( userSettings ) {
		var self = this,
			settings = {},
			elementsCache = {},
			defaultSettings = {
				element: '',
				groups: null,
				onDragStart: null,
				onDragEnd: null,
			};

		var initSettings = function() {
			$.extend( true, settings, defaultSettings, userSettings );
		};

		var initElementsCache = function() {
			elementsCache.$element = $( settings.element );
		};

		var buildElements = function() {
			elementsCache.$element.attr( 'draggable', true );
		};

		var onDragEnd = function( event ) {
			if ( 'function' === typeof settings.onDragEnd ) {
				settings.onDragEnd.call( elementsCache.$element, event, self );
			}
		};

		var onDragStart = function( event ) {
			var groups = settings.groups || [],
				dataContainer = {
					groups,
				};

			if ( hasFullDataTransferSupport( event ) ) {
				event.originalEvent.dataTransfer.setData( JSON.stringify( dataContainer ), true );
			}

			if ( 'function' === typeof settings.onDragStart ) {
				settings.onDragStart.call( elementsCache.$element, event, self );
			}
		};

		var attachEvents = function() {
			elementsCache.$element
				.on( 'dragstart', onDragStart )
				.on( 'dragend', onDragEnd );
		};

		var init = function() {
			initSettings();

			initElementsCache();

			buildElements();

			attachEvents();
		};

		this.destroy = function() {
			elementsCache.$element.off( 'dragstart', onDragStart );

			elementsCache.$element.removeAttr( 'draggable' );
		};

		init();
	};

	var Droppable = function( userSettings ) {
		var self = this,
			settings = {},
			elementsCache = {},
			currentElement,
			currentSide,
			currentPlaceholderOverride = null,
			isDroppingAllowedState = false,
			originalCurrentElementOpacity = null,
			placeholderContext = {},
			defaultSettings = {
				element: '',
				items: '>',
				horizontalThreshold: 0,
				horizontalSensitivity: '10%',
				axis: [ 'vertical', 'horizontal' ],
				placeholder: true,
				currentElementClass: 'html5dnd-current-element',
				placeholderClass: 'html5dnd-placeholder',
				hasDraggingOnChildClass: 'html5dnd-has-dragging-on-child',
				groups: null,
				isDroppingAllowed: null,
				getPlaceholderOverride: null,
				getFallbackItem: null,
				onDragEnter: null,
				onDragging: null,
				onDropping: null,
				onDragLeave: null,
			};

		var initSettings = function() {
			$.extend( settings, defaultSettings, userSettings );
		};

		var initElementsCache = function() {
			elementsCache.$element = $( settings.element );

			elementsCache.$placeholder = $( '<div>', { class: settings.placeholderClass } );
		};

		var hasHorizontalDetection = function() {
			if ( !! settings.axis ) {
				return -1 !== settings.axis.indexOf( 'horizontal' );
			}

			return placeholderContext.isFlexRowContainer;
		};

		var hasVerticalDetection = function() {
			if ( !! settings.axis ) {
				return -1 !== settings.axis.indexOf( 'vertical' );
			}

			return ! placeholderContext.isFlexRowContainer;
		};

		var checkHorizontal = function( offsetX, clientX, elementWidth ) {
			var isPercentValue,
				sensitivity;

			if ( ! hasHorizontalDetection() ) {
				return false;
			}

			if ( ! hasVerticalDetection() ) {
				const threshold = settings.horizontalThreshold,
					{ left, right } = placeholderContext.placeholderTarget.getBoundingClientRect();

				// For cases when the event is actually dispatched on the parent element, but
				// `currentElement` is the actual element that the offset should be calculated by.
				if ( clientX - threshold <= left ) {
					return 'left';
				}

				if ( clientX + threshold >= right ) {
					return 'right';
				}

				return offsetX > elementWidth / 2 ? 'right' : 'left';
			}

			sensitivity = settings.horizontalSensitivity.match( /\d+/ );

			if ( ! sensitivity ) {
				return false;
			}

			sensitivity = sensitivity[ 0 ];

			isPercentValue = /%$/.test( settings.horizontalSensitivity );

			if ( isPercentValue ) {
				sensitivity = elementWidth / sensitivity;
			}

			if ( offsetX > elementWidth - sensitivity ) {
				return 'right';
			} else if ( offsetX < sensitivity ) {
				return 'left';
			}

			return false;
		};

		var setSide = function( event ) {
			const { placeholderTarget } = placeholderContext;
			const $element = $( placeholderTarget );
			const elementHeight = $element.outerHeight() - elementsCache.$placeholder.outerHeight();
			const elementWidth = $element.outerWidth();

			event = event.originalEvent;

			currentSide = checkHorizontal( event.offsetX, event.clientX, elementWidth );

			if ( currentSide ) {
				return;
			}

			if ( ! hasVerticalDetection() ) {
				currentSide = null;

				return;
			}

			const elementPosition = placeholderTarget.getBoundingClientRect();

			currentSide = event.clientY > elementPosition.top + ( elementHeight / 2 ) ? 'bottom' : 'top';
		};

		// Lets a droppable place the placeholder outside its own subtree, so a drop that
		// targets a different level than the hovered element can still be previewed.
		var getPlaceholderOverride = function( event ) {
			if ( 'function' !== typeof settings.getPlaceholderOverride ) {
				return null;
			}

			return settings.getPlaceholderOverride.call( currentElement, currentSide, event, self );
		};

		var isSamePlaceholderOverride = function( override ) {
			return override?.element === currentPlaceholderOverride?.element &&
				override?.side === currentPlaceholderOverride?.side;
		};

		var insertPlaceholder = function( override = null ) {
			if ( ! settings.placeholder ) {
				return;
			}

			clearPreviousPlaceholder();
			clearOverridePlaceholder();

			currentPlaceholderOverride = override;

			if ( override ) {
				setOverridePlaceholder( elementsCache.$placeholder, override );

				return;
			}

			const insertMode = getInsertMode();

			switch ( insertMode ) {
				case 'atomicGrid':
					insertAtomicGridPlaceholder();
					break;
				case 'gridRow':
					insertGridRowPlaceholder();
					break;
				case 'flexRow':
					insertFlexRowPlaceholder();
					break;
				default:
					insertDefaultPlaceholder();
					break;
			}
		};

		const createPlaceholderContext = function() {
			if ( ! currentElement || ! currentElement.nodeType ) {
				return;
			}

			const $currentElement = $( currentElement );
			const hasLogicalWrapper = 'contents' === getComputedStyle( currentElement ).display;

			const container = currentElement.closest( '.e-con' );
			const containerDisplayStyle = container ? getComputedStyle( container ).display : null;

			const innerContainer = container?.querySelector( ':scope > .e-con-inner' );
			const containerWrapperStyle = !! container ? getComputedStyle( innerContainer || container ) : null;

			const isFlexContainer = !! container && [ 'flex', 'inline-flex' ].includes( containerWrapperStyle.display );
			const isRowDirection = !! container && [ 'row', 'row-reverse' ].includes( containerWrapperStyle.flexDirection );

			maybeAddFlexRowClass( container );

			return {
				$currentElement,
				placeholderTarget: hasLogicalWrapper ? currentElement.querySelector( ':scope > :not(.elementor-widget-placeholder)' ) : currentElement,
				$parentContainer: $currentElement.closest( '.e-con' ).parent().closest( '.e-con' ),
				isFirstInsert: $currentElement.hasClass( 'elementor-first-add' ),
				isInnerContainer: $currentElement.hasClass( 'e-con-inner' ),
				isGridRowContainer: 0 !== $currentElement.parents( '.e-grid.e-con--row' ).length,
				isAtomicGridContainer: 0 !== $currentElement.closest( '.e-grid-base' ).length,
				isFlexContainer,
				isRowDirection,
				isFlexRowContainer: isFlexContainer && isRowDirection,
				isBlockContainer: [ 'block', 'inline-block' ].includes( containerDisplayStyle ),
				hasLogicalWrapper,
				isAtomicContainer: [ 'e-div-block', 'e-flexbox', 'e-grid' ].includes( currentElement.dataset.element_type ),
			};
		};

		const maybeAddFlexRowClass = function( container ) {
			if ( ! container || container.classList.contains( 'e-grid' ) ) {
				return;
			}

			const { isFlexRowContainer } = placeholderContext;

			if ( isFlexRowContainer ) {
				container.classList.add( 'e-con--row' );
				return;
			}

			container.classList.remove( 'e-con--row' );
		};

		const getInsertMode = function() {
			if ( placeholderContext.isFirstInsert ) {
				return 'default';
			}

			if ( placeholderContext.isAtomicGridContainer ) {
				return 'atomicGrid';
			}

			if ( placeholderContext.isGridRowContainer ) {
				return 'gridRow';
			}

			if ( placeholderContext.isFlexRowContainer ) {
				return 'flexRow';
			}

			if ( placeholderContext.isBlockContainer ) {
				return 'block';
			}

			return 'default';
		};

		const clearPreviousPlaceholder = function() {
			placeholderContext.$parentContainer.find( '.elementor-widget-placeholder' ).remove();

			elementsCache.$placeholder.removeClass( 'e-dragging-left e-dragging-right e-dragging-top e-dragging-bottom is-logical' );
			elementsCache.$placeholder.css( '--e-placeholder-margin-top', '' );
			elementsCache.$placeholder.css( '--e-placeholder-margin-bottom', '' );
			elementsCache.$placeholder.css( '--e-placeholder-margin-inline-start', '' );
			elementsCache.$placeholder.css( '--e-placeholder-width', '' );
		};

		const insertPlaceholderInsideElement = function( targetElement = null ) {
			if ( ! targetElement ) {
				targetElement = currentElement;
			}

			const insertMethod = [ 'bottom', 'right' ].includes( currentSide ) ? 'appendTo' : 'prependTo';
			elementsCache.$placeholder[ insertMethod ]( targetElement );
		};

		const insertPlaceholderOutsideElement = function( targetElement = null ) {
			if ( ! targetElement ) {
				targetElement = currentElement;
			}

			const insertMethod = [ 'bottom', 'right' ].includes( currentSide ) ? 'after' : 'before';
			$( targetElement )[ insertMethod ]( elementsCache.$placeholder );
		};

		const VOID_PLACEHOLDER_TAGS = new Set( [
			'area',
			'base',
			'br',
			'col',
			'embed',
			'hr',
			'img',
			'input',
			'link',
			'meta',
			'param',
			'source',
			'track',
			'wbr',
		] );

		const isVoidPlaceholderTarget = function( element ) {
			return !! element?.tagName && VOID_PLACEHOLDER_TAGS.has( element.tagName.toLowerCase() );
		};

		const insertPlaceholderOutsideLogicalWrapperChild = function() {
			const { hasLogicalWrapper, placeholderTarget } = placeholderContext;

			if ( ! hasLogicalWrapper || ! placeholderTarget ) {
				return false;
			}

			insertPlaceholderOutsideElement( placeholderTarget );

			return true;
		};

		const getDefaultPlaceholderInsertPlan = function() {
			const { placeholderTarget, hasLogicalWrapper, isAtomicContainer } = placeholderContext;
			const insertTarget = placeholderTarget || currentElement;

			return {
				insertTarget,
				insertOutside: hasLogicalWrapper || isVoidPlaceholderTarget( insertTarget ),
				useLogicalAttributes: hasLogicalWrapper || isAtomicContainer,
			};
		};

		const insertAtomicGridPlaceholder = function() {
			if ( ! [ 'top', 'bottom' ].includes( currentSide ) ) {
				return;
			}

			const { placeholderTarget } = placeholderContext;

			elementsCache.$placeholder.addClass( 'e-dragging-' + currentSide );

			insertPlaceholderInsideElement( placeholderTarget );
		};

		const insertGridRowPlaceholder = function() {
			const { hasLogicalWrapper, placeholderTarget } = placeholderContext;

			// If we want to use horizontal placeholders inside V3, then we should remove these 3 lines of the code.
			if ( ! hasLogicalWrapper ) {
				elementsCache.$placeholder.addClass( 'e-dragging-' + currentSide );
			}

			insertPlaceholderInsideElement( placeholderTarget );
		};

		const insertFlexRowPlaceholder = function() {
			const { $currentElement, isInnerContainer } = placeholderContext;

			if ( insertPlaceholderOutsideLogicalWrapperChild() ) {
				return;
			}

			const $target = isInnerContainer ? $currentElement.closest( '.e-con' ) : $currentElement;

			insertPlaceholderOutsideElement( $target[ 0 ] );
		};

		const insertDefaultPlaceholder = function() {
			const { insertTarget, insertOutside, useLogicalAttributes } = getDefaultPlaceholderInsertPlan();

			if ( useLogicalAttributes ) {
				addLogicalAttributesToPlaceholder();
			}

			if ( insertOutside ) {
				insertPlaceholderOutsideElement( insertTarget );

				return;
			}

			insertPlaceholderInsideElement( insertTarget );
		};

		const addLogicalAttributesToPlaceholder = function() {
			const PLACEHOLDER_HEIGHT = 10;

			const { placeholderTarget } = placeholderContext;
			const placeholder = elementsCache.$placeholder[ 0 ];

			placeholder.classList.add( 'is-logical' );

			const styles = getComputedStyle( placeholderTarget );

			const paddingTop = parseFloat( styles.paddingTop ) || 0;
			const borderTop = parseFloat( styles.borderTopWidth ) || 0;

			const paddingBottom = parseFloat( styles.paddingBottom ) || 0;
			const borderBottom = parseFloat( styles.borderBottomWidth ) || 0;

			const paddingInlineStart = parseFloat( styles.paddingInlineStart ) || 0;
			const borderInlineStart = parseFloat( styles.borderInlineStartWidth ) || 0;

			const width = parseFloat( styles.width ) || '100%';

			const totalTopOffset = paddingTop + borderTop;
			const totalBottomOffset = paddingBottom + borderBottom;
			const totalInlineStartOffset = paddingInlineStart + borderInlineStart;

			placeholder.style.setProperty( '--e-placeholder-width', `${ width }px` );
			placeholder.style.setProperty( '--e-placeholder-margin-inline-start', `-${ totalInlineStartOffset }px` );

			if ( 'top' === currentSide ) {
				placeholder.style.setProperty( '--e-placeholder-margin-top', `-${ totalTopOffset }px` );
				placeholder.style.setProperty( '--e-placeholder-margin-bottom', `${ PLACEHOLDER_HEIGHT }px` );
			} else if ( 'bottom' === currentSide ) {
				placeholder.style.setProperty( '--e-placeholder-margin-bottom', `-${ totalBottomOffset }px` );
				placeholder.style.setProperty( '--e-placeholder-margin-top', `${ PLACEHOLDER_HEIGHT }px` );
			}
		};

		var isDroppingAllowed = function( event ) {
			var dataTransferTypes,
				draggableGroups,
				isGroupMatch,
				droppingAllowed;

			if ( settings.groups && hasFullDataTransferSupport( event ) ) {
				dataTransferTypes = event.originalEvent.dataTransfer.types;

				isGroupMatch = false;

				dataTransferTypes = Array.prototype.slice.apply( dataTransferTypes ); // Convert to array, since Firefox hold it as DOMStringList

				dataTransferTypes.forEach( function( type ) {
					try {
						draggableGroups = JSON.parse( type );

						if ( ! draggableGroups.groups.slice ) {
							return;
						}

						settings.groups.forEach( function( groupName ) {
							if ( -1 !== draggableGroups.groups.indexOf( groupName ) ) {
								isGroupMatch = true;

								return false; // Stops the forEach from extra loops
							}
						} );
						// eslint-disable-next-line no-empty
					} catch ( e ) {}
				} );

				if ( ! isGroupMatch ) {
					return false;
				}
			}

			if ( 'function' === typeof settings.isDroppingAllowed ) {
				droppingAllowed = settings.isDroppingAllowed.call( currentElement, currentSide, event, self );

				if ( ! droppingAllowed ) {
					return false;
				}
			}

			return true;
		};

		var onDragEnter = function( event ) {
			event.stopPropagation();

			if ( currentElement ) {
				return;
			}

			currentElement = this;

			// Get both parents and children and do a drag-leave on them in order to prevent UI glitches
			// of the placeholder that happen when the user drags from parent to child and vice versa.
			const $parents = elementsCache.$element.parents(),
				$children = elementsCache.$element.children();

			// Remove all current element classes to take in account nested Droppable instances.
			// TODO #1: Move to `doDragLeave()`?
			// TODO #2: Find a better solution.
			$children.find( '.' + settings.currentElementClass ).removeClass( settings.currentElementClass );

			$parents.add( $children ).each( function() {
				var droppableInstance = $( this ).data( 'html5Droppable' );

				if ( ! droppableInstance ) {
					return;
				}

				droppableInstance.doDragLeave();
			} );

			placeholderContext = createPlaceholderContext();

			setSide( event );

			$e.internal( 'editor/browser-import/validate', {
				input: event.originalEvent.dataTransfer.items,
			} ).then( ( importAllowed ) => {
				isDroppingAllowedState = isDroppingAllowed( event ) || importAllowed;

				if ( ! isDroppingAllowedState ) {
					return;
				}

				if ( currentElement?.classList?.contains( 'elementor-first-add' ) && currentElement.closest?.( '.e-grid-base' ) ) {
					originalCurrentElementOpacity = currentElement.style.opacity || '';
					currentElement.style.opacity = '1';
					$( document ).on( 'dragend', onDocumentDragEnd );
				}

				insertPlaceholder( getPlaceholderOverride( event ) );

				elementsCache.$element.addClass( settings.hasDraggingOnChildClass );

				$( currentElement ).addClass( settings.currentElementClass );

				if ( 'function' === typeof settings.onDragEnter ) {
					settings.onDragEnter.call( currentElement, currentSide, event, self );
				}
			} );
		};

		var onDragOver = function( event ) {
			event.stopPropagation();

			if ( ! currentElement ) {
				onDragEnter.call( this, event );
			}

			var oldSide = currentSide;

			setSide( event );

			if ( ! isDroppingAllowedState ) {
				return;
			}

			event.preventDefault();

			const placeholderOverride = getPlaceholderOverride( event );

			if ( oldSide !== currentSide || ! isSamePlaceholderOverride( placeholderOverride ) ) {
				insertPlaceholder( placeholderOverride );
			}

			if ( 'function' === typeof settings.onDragging ) {
				settings.onDragging.call( this, currentSide, event, self );
			}
		};

		var restoreFirstAddOpacity = function() {
			if ( null !== originalCurrentElementOpacity && currentElement?.style ) {
				currentElement.style.opacity = originalCurrentElementOpacity;
				originalCurrentElementOpacity = null;
			}
		};

		var onDocumentDragEnd = function() {
			$( document ).off( 'dragend', onDocumentDragEnd );
			restoreFirstAddOpacity();
		};

		var onDragLeave = function( event ) {
			var elementPosition = this.getBoundingClientRect();

			if ( 'dragleave' === event.type && ! (
				event.clientX < elementPosition.left ||
				event.clientX >= elementPosition.right ||
				event.clientY < elementPosition.top ||
				event.clientY >= elementPosition.bottom
			) ) {
				return;
			}

			$( currentElement ).removeClass( settings.currentElementClass );

			self.doDragLeave();

			isDroppingAllowedState = false;
		};

		var onDrop = function( event ) {
			event.preventDefault();

			// Matches `onDragEnter`/`onDragOver`, and keeps the fallback handler on the Droppable
			// itself from running a second time for a drop an item has already taken.
			event.stopPropagation();

			if ( ! currentElement ) {
				return;
			}

			setSide( event );

			if ( ! isDroppingAllowedState ) {
				return;
			}

			// The fallback handlers run on the Droppable itself rather than on a matched item,
			// so point `currentTarget` at the item the drop actually resolved to.
			event.currentTarget = currentElement;

			// Trigger a Droppable-specific `onDropping` callback.
			if ( settings.onDropping ) {
				settings.onDropping( currentSide, event );
			}
		};

		var isPointerOutside = function( element, event ) {
			var { left, right, top, bottom } = element.getBoundingClientRect(),
				{ clientX, clientY } = event.originalEvent || event;

			return clientX < left || clientX >= right || clientY < top || clientY >= bottom;
		};

		// Moving from an item out into the Droppable itself fires `dragenter` on the Droppable
		// before the item's `dragleave`, so the item is still current and the enter is ignored.
		var releaseStaleCurrentElement = function( event ) {
			if ( currentElement && isPointerOutside( currentElement, event ) ) {
				self.doDragLeave();
			}
		};

		// Runs only when no item matched, because a delegated handler stops propagation before
		// the event reaches the Droppable itself. Lets a drop that lands inside the Droppable
		// but outside any of its items still resolve to one.
		var withFallbackItem = function( handler ) {
			return function( event ) {
				var item = settings.getFallbackItem( event );

				if ( ! item ) {
					return;
				}

				return handler.call( item, event );
			};
		};

		// Only while tracking the pointer: on drop the element resolved by the last `dragover`
		// is the one to use, even though the pointer sits on the placeholder rather than on it.
		var withFreshFallbackItem = function( handler ) {
			var withItem = withFallbackItem( handler );

			return function( event ) {
				releaseStaleCurrentElement( event );

				return withItem.call( this, event );
			};
		};

		var fallbackHandlers = {};

		var attachEvents = function() {
			elementsCache.$element
				.on( 'dragenter', settings.items, onDragEnter )
				.on( 'dragover', settings.items, onDragOver )
				.on( 'drop', settings.items, onDrop )
				.on( 'dragleave drop', settings.items, onDragLeave );

			if ( 'function' !== typeof settings.getFallbackItem ) {
				return;
			}

			fallbackHandlers = {
				dragenter: withFreshFallbackItem( onDragEnter ),
				dragover: withFreshFallbackItem( onDragOver ),
				drop: withFallbackItem( onDrop ),
			};

			elementsCache.$element
				.on( 'dragenter', fallbackHandlers.dragenter )
				.on( 'dragover', fallbackHandlers.dragover )
				.on( 'drop', fallbackHandlers.drop )
				.on( 'dragleave drop', onDragLeave );
		};

		var init = function() {
			initSettings();

			initElementsCache();

			attachEvents();
		};

		this.doDragLeave = function() {
			clearOwnOverridePlaceholder( elementsCache.$placeholder );

			if ( settings.placeholder ) {
				elementsCache.$placeholder.remove();
			}

			elementsCache.$element.removeClass( settings.hasDraggingOnChildClass );

			$( document ).off( 'dragend', onDocumentDragEnd );
			restoreFirstAddOpacity();

			if ( 'function' === typeof settings.onDragLeave ) {
				settings.onDragLeave.call( currentElement, event, self );
			}

			currentElement = currentSide = null;
			currentPlaceholderOverride = null;
		};

		this.destroy = function() {
			elementsCache.$element
				.off( 'dragenter', settings.items, onDragEnter )
				.off( 'dragover', settings.items, onDragOver )
				.off( 'drop', settings.items, onDrop )
				.off( 'dragleave drop', settings.items, onDragLeave );

			if ( ! fallbackHandlers.dragenter ) {
				return;
			}

			elementsCache.$element
				.off( 'dragenter', fallbackHandlers.dragenter )
				.off( 'dragover', fallbackHandlers.dragover )
				.off( 'drop', fallbackHandlers.drop )
				.off( 'dragleave drop', onDragLeave );
		};

		init();
	};

	var plugins = {
		html5Draggable: Draggable,
		html5Droppable: Droppable,
	};

	$.each( plugins, function( pluginName, Plugin ) {
		$.fn[ pluginName ] = function( options ) {
			options = options || {};

			this.each( function() {
				var instance = $.data( this, pluginName ),
					hasInstance = instance instanceof Plugin;

				if ( hasInstance ) {
					if ( 'destroy' === options ) {
						instance.destroy();

						$.removeData( this, pluginName );
					}

					return;
				} else if ( 'destroy' === options ) {
					// Escape the loop when an element is destroyed before initialisation.
					return;
				}

				options.element = this;

				$.data( this, pluginName, new Plugin( options ) );
			} );

			return this;
		};
	} );
} )( jQuery );
