const ControlSelect2View = require( 'elementor-controls/select2' );

module.exports = ControlSelect2View.extend( {
	$previewContainer: null,

	getSelect2Options() {
		return {
			dir: elementorCommon.config.isRTL ? 'rtl' : 'ltr',
			templateSelection: this.fontPreviewTemplate,
			templateResult: this.fontPreviewTemplate,
		};
	},

	onReady() {
		const self = this;
		this.ui.select.select2( this.getSelect2Options() );
		this.ui.select.on( 'select2:open', function() {
			self.$previewContainer = jQuery( '.select2-results__options[role="tree"]:visible' );
			// load initial?
			setTimeout( function() {
				self.enqueueFontsInView();
			}, 100 );

			// On search
			jQuery( 'input.select2-search__field:visible' ).on( 'keyup', function() {
				self.typeStopDetection.action.apply( self );
			} );

			// On scroll
			self.$previewContainer.on( 'scroll', function() {
				self.scrollStopDetection.onScroll.apply( self );
			} );
		} );
	},

	typeStopDetection: {
		idle: 350,
		timeOut: null,
		action() {
			const parent = this,
				self = this.typeStopDetection;
			clearTimeout( self.timeOut );
			self.timeOut = setTimeout( function() {
				parent.enqueueFontsInView();
			}, self.idle );
		},
	},

	scrollStopDetection: {
		idle: 350,
		timeOut: null,
		onScroll() {
			const parent = this,
				self = this.scrollStopDetection;
			clearTimeout( self.timeOut );
			self.timeOut = setTimeout( function() {
				parent.enqueueFontsInView();
			}, self.idle );
		},
	},

	enqueueFontsInView() {
		const self = this,
			containerOffset = this.$previewContainer.offset(),
			top = containerOffset.top,
			bottom = top + this.$previewContainer.innerHeight(),
			fontsInView = [];

		this.$previewContainer.children().find( 'li:visible' ).each( function( index, font ) {
			const $font = jQuery( font ),
				offset = $font.offset();
			if ( offset && offset.top > top && offset.top < bottom ) {
				fontsInView.push( $font );
			}
		} );

		fontsInView.forEach( function( font ) {
			const fontFamily = jQuery( font ).find( 'span' ).html();
			elementor.helpers.enqueueFont( fontFamily, 'editor' );
		} );
	},

	fontPreviewTemplate( state ) {
		if ( ! state.id ) {
			return state.text;
		}

		return jQuery( '<span>', {
			text: state.text,
			css: {
				'font-family': state.element.value.toString(),
			},
		} );
	},

	templateHelpers() {
		var helpers = ControlSelect2View.prototype.templateHelpers.apply( this, arguments ),
			fonts = this.model.get( 'options' );

		helpers.getFontsByGroups = function( groups ) {
			var filteredFonts = {};

			_.each( fonts, function( fontType, fontName ) {
				if ( ( _.isArray( groups ) && _.contains( groups, fontType ) ) || fontType === groups ) {
					filteredFonts[ fontName ] = fontName;
				}
			} );

			return filteredFonts;
		};

		return helpers;
	},
} );
