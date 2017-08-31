var ViewModule = require( '../../utils/view-module' );

module.exports = ViewModule.extend( {
	getDefaultSettings: function() {
		return {
			element: null,
			direction: elementorFrontend.config.is_rtl ? 'right' : 'left',
			selectors: {
				container: 'window'
			}
		};
	},

	getDefaultElements: function() {
		return {
			$element: jQuery( this.getSettings( 'element' ) )
		};
	},

	stretch: function() {
		var containerSelector = this.getSettings( 'selectors.container' ),
			$element = this.elements.$element,
			$container = jQuery( containerSelector ),
			isSpecialContainer = window !== $container[0],
			containerWidth = $container.outerWidth(),
			sectionWidth = $element.outerWidth(),
			sectionOffset = $element.offset().left,
			correctOffset = sectionOffset;

		if ( isSpecialContainer ) {
			var containerOffset = $container.offset().left;

			if ( sectionOffset > containerOffset ) {
				correctOffset = sectionOffset - containerOffset;
			} else {
				correctOffset = 0;
			}
		}

		if ( elementorFrontend.config.is_rtl ) {
			correctOffset = containerWidth - ( sectionWidth + correctOffset );
		}

		var css = {};

		css.width = containerWidth + 'px';

		css[ this.getSettings( 'direction' ) ] = -correctOffset + 'px';

		$element.css( css );
	},

	reset: function() {
		var css = {};

		css.width = 'auto';

		css[ this.getSettings( 'direction' ) ] = 0;

		this.elements.$element.css( css );
	}
} );
