module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-templates-modal__header__logo',

	className: 'elementor-templates-modal__header__logo',

	events: {
		'click': 'onClick'
	},

	templateHelpers: function() {
		return {
			title: this.getOption( 'title' )
		};
	},

	onClick: function() {
		var clickCallback = this.getOption( 'click' );

		if ( clickCallback ) {
			clickCallback();
		}
	}
} );
