module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-panel-menu-item',

	className: 'elementor-panel-menu-item',

	triggers: {
		click: 'click'
	}
} );
