module.exports = Marionette.ItemView.extend( {
	tagName: 'span',

	className: 'elementor-tag',

	id: function() {
		return 'elementor-tag-' + this.model.get( 'id' );
	},

	getTemplate: function() {
		return '#tmpl-elementor-tag-' + this.getOption( 'name' ) + '-content';
	}
} );
