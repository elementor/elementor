module.exports = elementorModules.ViewModule.extend( {
	getDefaultSettings() {
		return {
			element: null,
			direction: elementorFrontend.config.is_rtl ? 'right' : 'left',
			selectors: {
				container: window,
			},
		};
	},

	getDefaultElements() {
		return {
			$element: jQuery( this.getSettings( 'element' ) ),
		};
	},

	stretch() {
		var containerSelector = this.getSettings( 'selectors.container' ),
			$container;

		try {
			$container = jQuery( containerSelector );
			// eslint-disable-next-line no-empty
		} catch ( e ) {}

		if ( ! $container || ! $container.length ) {
			$container = jQuery( this.getDefaultSettings().selectors.container );
		}

		this.reset();

		var $element = this.elements.$element,
			containerWidth = $container.innerWidth(),
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

		if ( ! isFixed ) {
			if ( elementorFrontend.config.is_rtl ) {
				correctOffset = containerWidth - ( $element.outerWidth() + correctOffset );
			}

			correctOffset = -correctOffset;
		}

		var css = {};

		css.width = containerWidth + 'px';

		css[ this.getSettings( 'direction' ) ] = correctOffset + 'px';

		$element.css( css );
	},

	reset() {
		var css = {};

		css.width = '';

		css[ this.getSettings( 'direction' ) ] = '';

		this.elements.$element.css( css );
	},
} );
