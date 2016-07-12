var PanelSchemeDisabledView;

PanelSchemeDisabledView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-schemes-disabled',

	disabledTitle: '',

	templateHelpers: function() {
		return {
			disabledTitle: this.disabledTitle
		};
	},

	id: 'elementor-panel-schemes-disabled'
} );

module.exports = PanelSchemeDisabledView;
