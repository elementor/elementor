var ApplyAiTitlesNavigatorBehavior;
ApplyAiTitlesNavigatorBehavior = Marionette.Behavior.extend( {
	ui: {
		aiTitlesButton: '#elementor-navigator__ai-titles',
	},

	events: {
		'click @ui.aiTitlesButton': 'aiTitleClickHandler',
	},

	getTemplate() {
		console.log( 'getTemplate' );
		// Build a template with jquery of a button
		return $( '<button id="elementor-navigator__ai-titles" class="elementor-button elementor-button-default elementor-button-icon elementor-button-icon-left" aria-label="AI Titles" title="AI Titles"><i class="eicon-library"></i><span>AI Titles</span></button>' )[ 0 ].outerHTML;
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
		}
	},
} );
export default ApplyAiTitlesNavigatorBehavior;
