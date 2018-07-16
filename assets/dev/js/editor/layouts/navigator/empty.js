module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-navigator__elements--empty',

	className: 'elementor-empty-view',

	onRender: function() {
		this.$el.css( 'padding-' + ( elementor.config.is_rtl ? 'right' : 'left' ), this.getOption( 'distance' ) );
	}
} );
