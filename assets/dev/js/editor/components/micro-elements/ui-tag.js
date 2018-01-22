var Tag = require( 'elementor-micro-elements/tag' );

module.exports = Tag.extend( {
	tagName: 'span',

	className: function() {
		return 'elementor-tag';
	},

	getTemplate: function() {
		return '#tmpl-elementor-tag-' + this.getOption( 'name' ) + '-content';
	},

	getContent: function() {
		this.render();

		return this.el.outerHTML;
	},

	onRender: function() {
		this.el.id = 'elementor-tag-' + this.getOption( 'id' );
	}
} );
