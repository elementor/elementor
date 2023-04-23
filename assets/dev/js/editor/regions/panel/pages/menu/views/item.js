module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-menu-item',

	className() {
		return 'elementor-panel-menu-item elementor-panel-menu-item-' + this.model.get( 'name' );
	},

	triggers: {
		click: {
			event: 'click',
			preventDefault: false,
		},
	},
} );
