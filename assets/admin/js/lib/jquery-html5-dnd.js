/**
 * HTML5 - Drag and Drop
 */

;(function( $ ) {

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
				onDragEnd: null
			};

		var init = function() {
			initSettings();

			initElementsCache();

			buildElements();

			attachEvents();
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

		var attachEvents = function() {
			elementsCache.$element
				.on( 'dragstart', onDragStart )
				.on( 'dragend', onDragEnd );
		};

		var onDragStart = function( event ) {
			var groups = settings.groups || [],
				dataContainer = {
					groups: groups
				};

			if ( hasFullDataTransferSupport( event ) ) {
				event.originalEvent.dataTransfer.setData( JSON.stringify( dataContainer ), true );
			}

			if ( $.isFunction( settings.onDragStart ) ) {
				settings.onDragStart.call( elementsCache.$element, event, self );
			}
		};

		var onDragEnd = function( event ) {
			if ( $.isFunction( settings.onDragEnd ) ) {
				settings.onDragEnd.call( elementsCache.$element, event, self );
			}
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
			defaultSettings = {
				element: '',
				items: '>',
				horizontalSensitivity: '10%',
				axis: [ 'vertical', 'horizontal' ],
				groups: null,
				isDroppingAllowed: null,
				onDragEnter: null,
				onDragging: null,
				onDropping: null,
				onDragLeave: null
			};

		var init = function() {
			initSettings();

			initElementsCache();

			attachEvents();
		};

		var initSettings = function() {
			$.extend( settings, defaultSettings, userSettings );
		};

		var initElementsCache = function() {
			elementsCache.$element = $( settings.element );
		};

		var attachEvents = function() {
			elementsCache.$element
				.on( 'dragenter', settings.items, onDragEnter )
				.on( 'dragover', settings.items, onDragOver )
				.on( 'drop', settings.items, onDrop )
				.on( 'dragleave drop', settings.items, onDragLeave );
		};

		var checkHorizontal = function( offsetX, elementWidth ) {
			var isPercentValue,
				sensitivity;

			if ( ! hasHorizontalDetection() ) {
				return false;
			}

			if ( ! hasVerticalDetection() ) {
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

		var hasHorizontalDetection = function() {
			return -1 !== settings.axis.indexOf( 'horizontal' );
		};

		var hasVerticalDetection = function() {
			return -1 !== settings.axis.indexOf( 'vertical' );
		};

		var getSide = function( element, event ) {
			var $element,
				thisHeight,
				thisWidth,
				side;

			event = event.originalEvent;

			$element = $( element );
			thisHeight = $element.outerHeight();
			thisWidth = $element.outerWidth();

			if ( side = checkHorizontal( event.offsetX, thisWidth ) ) {
				return side;
			}

			if ( ! hasVerticalDetection() ) {
				return false;
			}

			if ( event.offsetY > thisHeight / 2 ) {
				side = 'bottom';
			} else {
				side = 'top';
			}

			return side;
		};

		var isDroppingAllowed = function( element, side, event ) {
			var dataTransferTypes,
				draggableGroups,
				isGroupMatch,
				isDroppingAllowed;

			if ( settings.groups && hasFullDataTransferSupport( event ) ) {

				dataTransferTypes = event.originalEvent.dataTransfer.types;
				isGroupMatch = false;

				dataTransferTypes = Array.prototype.slice.apply( dataTransferTypes ); // Convert to array, since Firefox hold him as DOMStringList

				dataTransferTypes.forEach( function( type ) {
					try {
						draggableGroups = JSON.parse( type );

						if ( ! draggableGroups.groups.slice ) {
							return;
						}

						settings.groups.forEach( function( groupName ) {

							if ( -1 !== draggableGroups.groups.indexOf( groupName ) ) {
								isGroupMatch = true;
								return false; // stops the forEach from extra loops
							}
						} );
					} catch ( e ) {
					}
				} );

				if ( ! isGroupMatch ) {
					return false;
				}
			}

			if ( $.isFunction( settings.isDroppingAllowed ) ) {

				isDroppingAllowed = settings.isDroppingAllowed.call( element, side, event, self );

				if ( ! isDroppingAllowed ) {
					return false;
				}
			}

			return true;
		};

		var onDragEnter = function( event ) {
			if ( event.target !== this ) {
				return;
			}

			// Avoid internal elements event firing
			$( this ).children().each( function() {
				var currentPointerEvents = this.style.pointerEvents;

				if ( 'none' === currentPointerEvents ) {
					return;
				}

				$( this )
					.data( 'backup-pointer-events', currentPointerEvents )
					.css( 'pointer-events', 'none' );
			} );

			var side = getSide( this, event );

			if ( ! isDroppingAllowed( this, side, event ) ) {
				return;
			}

			if ( $.isFunction( settings.onDragEnter ) ) {
				settings.onDragEnter.call( this, side, event, self );
			}
		};

		var onDragOver = function( event ) {
			var side = getSide( this, event );

			if ( ! isDroppingAllowed( this, side, event ) ) {
				return;
			}

			event.preventDefault();

			if ( $.isFunction( settings.onDragging ) ) {
				settings.onDragging.call( this, side, event, self );
			}
		};

		var onDrop = function( event ) {
			var side = getSide( this, event );

			if ( ! isDroppingAllowed( this, side, event ) ) {
				return;
			}

			event.preventDefault();

			if ( $.isFunction( settings.onDropping ) ) {
				settings.onDropping.call( this, side, event, self );
			}
		};

		var onDragLeave = function( event ) {
			// Avoid internal elements event firing
			$(this).children().each( function() {
				var $this = $( this ),
					backupPointerEvents = $this.data( 'backup-pointer-events' );

				if ( undefined === backupPointerEvents ) {
					return;
				}

				$this
					.removeData( 'backup-pointer-events' )
					.css( 'pointer-events', backupPointerEvents );
			} );

			if ( $.isFunction( settings.onDragLeave ) ) {
				settings.onDragLeave.call( this, event, self );
			}
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
		html5Droppable: Droppable
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
				}

				options.element = this;

				$.data( this, pluginName, new Plugin( options ) );
			} );

			return this;
		};
	} );
})( jQuery );
