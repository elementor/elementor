var ApplyTemplateForAi;

ApplyTemplateForAi = Marionette.Behavior.extend( {
	ui: {
		applyButton: '.elementor-template-library-template-apply-ai',
	},

	events: {
		'click @ui.applyButton': 'onApplyButtonClick',
	},

	onApplyButtonClick() {
		const args = {
			model: this.view.model,
		};

		this.ui.applyButton.addClass( 'elementor-disabled' );

		if ( 'remote' === args.model.get( 'source' ) && ! elementor.config.library_connect.is_connected ) {
			$e.route( 'library/connect', args );
			return;
		}

		$e.run( 'library/generate-ai-variation', args );
	},
} );

module.exports = ApplyTemplateForAi;
