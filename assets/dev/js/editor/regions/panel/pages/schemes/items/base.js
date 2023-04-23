var PanelSchemeItemView;

PanelSchemeItemView = Marionette.ItemView.extend( {
	getTemplate() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-panel-scheme-' + this.getUIType() + '-item' );
	},

	className() {
		return 'elementor-panel-scheme-item';
	},
} );

module.exports = PanelSchemeItemView;
