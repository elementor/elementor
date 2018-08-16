module.exports = Marionette.ItemView.extend( {

	hasTemplate: true,

	tagName: 'span',

	className: function() {
		return 'elementor-tag';
	},

	getTemplate: function() {
		if ( ! this.hasTemplate ) {
			return false;
		}

		return Marionette.TemplateCache.get( '#tmpl-elementor-tag-' + this.getOption( 'name' ) + '-content' );
	},

	initialize: function() {
		try {
			this.getTemplate();
		} catch ( e ) {
			this.hasTemplate = false;
		}
	},

	getConfig: function( key ) {
		var config = elementor.dynamicTags.getConfig( 'tags.' + this.getOption( 'name' ) );

		if ( key ) {
			return config[ key ];
		}

		return config;
	},

	getContent: function() {
		var contentType = this.getConfig( 'content_type' ),
			data;

		if ( ! this.hasTemplate ) {
			data = elementor.dynamicTags.loadTagDataFromCache( this );

			if ( undefined === data ) {
				throw new Error( elementor.dynamicTags.CACHE_KEY_NOT_FOUND_ERROR );
			}
		}

		if ( 'ui' === contentType ) {
			this.render();

			if ( this.hasTemplate ) {
				return this.el.outerHTML;
			}

			if ( this.getConfig( 'wrapped_tag' ) ) {
				data = jQuery( data ).html();
			}

			this.$el.html( data );
		}

		return data;
	},

	onRender: function() {
		this.el.id = 'elementor-tag-' + this.getOption( 'id' );
	}
} );
