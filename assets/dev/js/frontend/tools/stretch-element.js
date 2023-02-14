module.exports = elementorModules.ViewModule.extend( {
	getDefaultSettings() {
		return {
			element: null,
			direction: elementorFrontend.config.is_rtl ? 'right' : 'left',
			selectors: {
				container: window,
			},
			considerScrollbar: false,
		};
	},

	getDefaultElements() {
		return {
			$element: jQuery( this.getSettings( 'element' ) ),
		};
	},

	stretch() {
		var settings = this.getSettings(),
			$container;

		try {
			$container = jQuery( settings.selectors.container );
			// eslint-disable-next-line no-empty
		} catch ( e ) {}

		if ( ! $container || ! $container.length ) {
			$container = jQuery( this.getDefaultSettings().selectors.container );
		}

		this.reset();

		var $element = this.elements.$element,
			containerWidth = $container.innerWidth(),
			scrollbarWidth = window.innerWidth - containerWidth,
			elementOffset = $element.offset().left,
			isFixed = 'fixed' === $element.css( 'position' ),
			correctOffset = isFixed ? 0 : elementOffset;

		if ( window !== $container[ 0 ] ) {
			var containerOffset = $container.offset().left;

			if ( isFixed ) {
				correctOffset = containerOffset;
			}
			if ( elementOffset > containerOffset ) {
				correctOffset = elementOffset - containerOffset;
			}
		}

		if ( settings.considerScrollbar ) {
			correctOffset -= scrollbarWidth;
		}

		if ( ! isFixed ) {
			if ( elementorFrontend.config.is_rtl ) {
				correctOffset = containerWidth - ( $element.outerWidth() + correctOffset );
			}

			correctOffset = -correctOffset;
		}

		var css = {};

		css.width = containerWidth + 'px';

		css[ settings.direction ] = correctOffset + 'px';

		$element.css( css );
	},

	reset() {
		var css = {};

		css.width = '';

		css[ this.getSettings( 'direction' ) ] = '';

		this.elements.$element.css( css );
	},
} );
