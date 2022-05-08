var PanelSchemeDisabledView;

PanelSchemeDisabledView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-schemes-disabled',

	id: 'elementor-panel-schemes-disabled',

	className: 'elementor-nerd-box',

	disabledTitle: '',

	templateHelpers() {
		return {
			disabledTitle: this.disabledTitle,
		};
	},
} );

module.exports = PanelSchemeDisabledView;
