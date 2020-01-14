export default class extends Marionette.ItemView {
	id() {
		return 'elementor-kit-panel-header';
	}

	getTemplate() {
		return '#tmpl-elementor-kit-panel-header';
	}

	ui() {
		return {
			title: '#elementor-kit__panel-header__title',
			closeButton: '#elementor-kit__panel-header__close-button',
			backButton: '#elementor-kit__panel-header__back-button',
		};
	}

	events() {
		return {
			'click @ui.closeButton': 'onClickClose',
			'click @ui.backButton': 'onClickBack',
		};
	}

	templateHelpers() {
		return {
			hasHistory: ( $e.routes.historyPerComponent[ 'panel/global' ] && 1 <= $e.routes.historyPerComponent[ 'panel/global' ].length ),
		};
	}

	setTitle( title ) {
		this.ui.title.html( title );
	}

	onClickClose() {
		// The kit is opened directly.
		if ( elementor.config.initial_document.id === elementor.config.document.id ) {
			$e.run( 'panel/global/exit' );
		} else {
			$e.run( 'panel/global/close' );
		}
	}

	onClickBack() {
		$e.routes.back( 'panel/global' );
	}
}
