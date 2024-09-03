var ApplyAiTitlesNavigatorBehavior;
ApplyAiTitlesNavigatorBehavior = Marionette.Behavior.extend( {
	ui: {
		aiTitlesButton: '#elementor-navigator__ai-titles',
	},

	events: {
		'click @ui.aiTitlesButton': 'aiTitleClickHandler',
	},

	initialize() {
		try {
			this.getTemplate();
		} catch ( e ) {
			this.hasTemplate = false;
		}
	},

	getTemplate() {
		const $button = jQuery( '<button>', {
			id: 'elementor-navigator__ai-titles',
		} );
		$button.html( '<i class="eicon-ai"></i>' );
		return $button[ 0 ].outerHTML;
	},

	aiTitleClickHandler() {
		window.location.hash = 'welcome-ai-return-to-ai-titles';
		window.addEventListener( 'hashchange', this.handleHashChange.bind( this ) );
	},

	handleHashChange() {
		if ( elementorCommon.config.library_connect?.is_connected && window.location.hash.includes( 'ai-titles' ) ) {
			window.location.hash = '';
			window.location.reload();
		}
	},

	onShow() {
		if ( elementorCommon.config.library_connect?.is_connected ) {
			this.ui.aiTitlesButton.remove();
		} else {
			const $targetElement = this.view.$el.find( '#elementor-navigator__toggle-all' );

			if ( $targetElement.length ) {
				$targetElement.after( this.getTemplate() );
			}
		}
	},
} );
export default ApplyAiTitlesNavigatorBehavior;
