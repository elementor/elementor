module.exports = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-navigator',

	id: 'elementor-navigator__inner',

	ui: {
		toggleAll: '#elementor-navigator__toggle-all',
		close: '#elementor-navigator__close'
	},

	events: {
		'click @ui.toggleAll': 'toggleAll',
		'click @ui.close': 'onCloseClick'
	},

	regions: {
		elements: '#elementor-navigator__elements'
	},

	toggleAll: function() {
		var state = 'expand' === this.ui.toggleAll.data( 'elementor-action' ),
			classes = [ 'eicon-collapse', 'eicon-expand' ];

		this.ui.toggleAll
			.data( 'elementor-action', state ? 'collapse' : 'expand' )
			.removeClass( classes[ +state ] )
			.addClass( classes[ +! state ] );

		this.elements.currentView.recursiveChildInvoke( 'toggleList', state );
	},

	activateElementsMouseInteraction: function() {
		this.elements.currentView.recursiveChildInvoke( 'activateMouseInteraction' );
	},

	deactivateElementsMouseInteraction: function() {
		this.elements.currentView.recursiveChildInvoke( 'deactivateMouseInteraction' );
	},

	onShow: function() {
		var ElementView = require( 'elementor-layouts/navigator/element' );

		this.elements.show( new ElementView( {
			model: elementor.elementsModel
		} ) );
	},

	onCloseClick: function() {
		elementor.navigator.close();
	}
} );
