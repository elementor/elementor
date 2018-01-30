module.exports = Marionette.ItemView.extend( {

	hasTemplate: true,

	tagName: 'span',

	className: function() {
		return 'elementor-tag';
	},

	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-tag-' + this.getOption( 'name' ) + '-content' );
	},

	initialize: function() {
		try {
			this.getTemplate();
		} catch ( e ) {
			this.hasTemplate = false;
		}
	},

	getContent: function() {
		if ( this.hasTemplate ) {
			this.render();

			return this.el.outerHTML;
		}

		var data = elementor.dynamicTags.loadTagDataFromCache( this );

		if ( undefined === data ) {
			throw new Error();
		}

		return data;
	},

	onRender: function() {
		this.el.id = 'elementor-tag-' + this.getOption( 'id' );
	}
} );
