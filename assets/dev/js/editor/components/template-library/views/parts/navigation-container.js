module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-navigation-container',

	className: 'elementor-template-library-navigation-container',

	ui: {
		title: '.elementor-template-library-current-folder-title',
		backButton: '.elementor-template-library-navigation-back-button',
	},

	events: {
		'click @ui.backButton': 'onBackButtonClick',
	},

	render() {
		if ( null === elementor.templates.getFilter( 'parent' ) ) {
			return this;
		}

		return Marionette.ItemView.prototype.render.call( this );
	},

	onRender() {
		this.ui.title.text( elementor.templates.getFilter( 'parent' )?.title );
	},

	onBackButtonClick() {
		elementor.templates.setFilter( 'parent', null );

		$e.route( 'library/templates/my-templates' );
	},
} );
