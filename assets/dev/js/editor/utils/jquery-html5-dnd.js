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
			isDroppingAllowedState = false,
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
			return -1 !== settings.axis.indexOf( 'horizontal' );
		};

		var hasVerticalDetection = function() {
			return -1 !== settings.axis.indexOf( 'vertical' );
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

		var insertPlaceholder = function() {
			if ( ! settings.placeholder ) {
				return;
			}

			ensureMinimumDroppableHeight();
			clearPreviousPlaceholder();

			const insertMode = getInsertMode();

			switch ( insertMode ) {
				case 'gridRow':
					insertGridRowPlaceholder();
					break;
				case 'flexRow':
					insertFlexRowPlaceholder();
					break;
				case 'block':
					insertBlockContainerPlaceholder();
					break;
				default:
					insertDefaultPlaceholder();
					break;
			}
		};

		const ensureMinimumDroppableHeight = function() {
			const { placeholderTarget, hasLogicalWrapper } = placeholderContext;
			const MIN_HEIGHT = 20;

			if ( ! hasLogicalWrapper ) {
				return;
			}

			placeholderTarget.classList.remove( 'e-min-height' );

			const targetHeight = placeholderTarget.offsetHeight;

			if ( targetHeight < MIN_HEIGHT ) {
				placeholderTarget.classList.add( 'e-min-height' );
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

			maybeAddFlexRowClass( container );

			return {
				$currentElement,
				placeholderTarget: hasLogicalWrapper ? currentElement.querySelector( ':not(.elementor-widget-placeholder)' ) : currentElement,
				$parentContainer: $currentElement.closest( '.e-con' ).parent().closest( '.e-con' ),
				isFirstInsert: $currentElement.hasClass( 'elementor-first-add' ),
				isInnerContainer: $currentElement.hasClass( 'e-con-inner' ),
				isGridRowContainer: 0 !== $currentElement.parents( '.e-grid.e-con--row' ).length,
				isRowContainer: 0 !== $currentElement.parents( '.e-con--row' ).length,
				isBlockContainer: [ 'block', 'inline-block' ].includes( containerDisplayStyle ),
				hasLogicalWrapper,
			};
		};

		const maybeAddFlexRowClass = function( container ) {
			if ( ! container ) {
				return;
			}

			const innerContainer = container.querySelector( ':scope > .e-con-inner' );
			const wrapperStyle = getComputedStyle( innerContainer || container );
			const isFlexContainer = [ 'flex', 'inline-flex' ].includes( wrapperStyle.display );
			const isRowDirection = [ 'row', 'row-reverse' ].includes( wrapperStyle.flexDirection );

			if ( isFlexContainer && isRowDirection ) {
				container.classList.add( 'e-con--row' );
				return;
			}

			container.classList.remove( 'e-con--row' );
		};

		const getInsertMode = function() {
			if ( placeholderContext.isFirstInsert ) {
				return 'default';
			}

			if ( placeholderContext.isGridRowContainer ) {
				return 'gridRow';
			}

			if ( placeholderContext.isRowContainer ) {
				return 'flexRow';
			}

			if ( placeholderContext.isBlockContainer ) {
				return 'block';
			}

			return 'default';
		};

		const clearPreviousPlaceholder = function() {
			placeholderContext.$parentContainer.find( '.elementor-widget-placeholder' ).remove();

			elementsCache.$placeholder.removeClass( 'e-dragging-left e-dragging-right is-logical' );
			elementsCache.$placeholder.css( '--e-row-gap', '' );
		};

		const insertPlaceholderInsideElement = function( targetElement = null ) {
			if ( ! targetElement ) {
				targetElement = currentElement;
			}

			const insertMethod = [ 'bottom', 'right' ].includes( currentSide ) ? 'appendTo' : 'prependTo';
			elementsCache.$placeholder[ insertMethod ]( currentElement );
		};

		const insertPlaceholderOutsideElement = function( targetElement = null ) {
			if ( ! targetElement ) {
				targetElement = currentElement;
			}

			const insertMethod = [ 'bottom', 'right' ].includes( currentSide ) ? 'after' : 'before';

			$( targetElement )[ insertMethod ]( elementsCache.$placeholder );
		};

		const insertGridRowPlaceholder = function() {
			elementsCache.$placeholder.addClass( 'e-dragging-' + currentSide );
			insertPlaceholderInsideElement();
		};

		const insertFlexRowPlaceholder = function() {
			const { $currentElement, isInnerContainer } = placeholderContext;
			const $target = isInnerContainer ? $currentElement.closest( '.e-con' ) : $currentElement;

			insertPlaceholderOutsideElement( $target[ 0 ] );
		};

		const insertBlockContainerPlaceholder = function() {
			insertPlaceholderOutsideElement();
		};

		const insertDefaultPlaceholder = function() {
			const { placeholderTarget, hasLogicalWrapper } = placeholderContext;

			if ( hasLogicalWrapper ) {
				addLogicalAttributesToPlaceholder();
			}

			insertPlaceholderInsideElement( placeholderTarget );
		};

		const addLogicalAttributesToPlaceholder = function() {
			const elementContainer = currentElement.closest( '.e-con, .e-con-inner' );
			const wrapperStyle = getComputedStyle( elementContainer );
			const rowGap = wrapperStyle.rowGap || wrapperStyle.gap || '0px';

			elementsCache.$placeholder.addClass( 'is-logical' );
			elementsCache.$placeholder.css( '--e-row-gap', rowGap );
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

				insertPlaceholder();

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

			if ( oldSide !== currentSide ) {
				insertPlaceholder();
			}

			if ( 'function' === typeof settings.onDragging ) {
				settings.onDragging.call( this, currentSide, event, self );
			}
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

			setSide( event );

			if ( ! isDroppingAllowedState ) {
				return;
			}

			// Trigger a Droppable-specific `onDropping` callback.
			if ( settings.onDropping ) {
				settings.onDropping( currentSide, event );
			}
		};

		var attachEvents = function() {
			elementsCache.$element
				.on( 'dragenter', settings.items, onDragEnter )
				.on( 'dragover', settings.items, onDragOver )
				.on( 'drop', settings.items, onDrop )
				.on( 'dragleave drop', settings.items, onDragLeave );
		};

		var init = function() {
			initSettings();

			initElementsCache();

			attachEvents();
		};

		this.doDragLeave = function() {
			if ( settings.placeholder ) {
				elementsCache.$placeholder.remove();
			}

			elementsCache.$element.removeClass( settings.hasDraggingOnChildClass );

			if ( 'function' === typeof settings.onDragLeave ) {
				settings.onDragLeave.call( currentElement, event, self );
			}

			currentElement = currentSide = null;
		};

		this.destroy = function() {
			elementsCache.$element
				.off( 'dragenter', settings.items, onDragEnter )
				.off( 'dragover', settings.items, onDragOver )
				.off( 'drop', settings.items, onDrop )
				.off( 'dragleave drop', settings.items, onDragLeave );
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
