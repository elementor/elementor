var PanelSchemeItemView;

PanelSchemeItemView = Marionette.ItemView.extend( {
	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-panel-scheme-' + this.getUIType() + '-item' );
	},

	className: function() {
		return 'elementor-panel-scheme-item';
	}
} );

module.exports = PanelSchemeItemView;
