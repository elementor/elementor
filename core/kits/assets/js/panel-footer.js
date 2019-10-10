const Footer = require( 'elementor/assets/dev/js/editor/regions/panel/footer.js' );

export default class extends Footer {
	id() {
		return 'elementor-kit-panel-footer';
	}

	getTemplate() {
		return '#tmpl-elementor-kit-panel-footer';
	}

	ui() {
		return {
			menuButtons: '.elementor-panel-footer-tool',
			settings: '#elementor-panel-footer-settings',
			deviceModeIcon: '#elementor-panel-footer-responsive > i',
			deviceModeButtons: '#elementor-panel-footer-responsive .elementor-panel-footer-sub-menu-item',
			saveTemplate: '#elementor-panel-footer-sub-menu-item-save-template',
			history: '#elementor-panel-footer-history',
			library: '#elementor-panel-footer-library',
		};
	}

	events() {
		return {
			'click @ui.menuButtons': 'onMenuButtonsClick',
			'click @ui.settings': 'onSettingsClick',
			'click @ui.deviceModeButtons': 'onResponsiveButtonsClick',
			'click @ui.saveTemplate': 'onSaveTemplateClick',
			'click @ui.history': 'onHistoryClick',
			'click @ui.library': 'onLibraryClick',
		};
	}

	onSettingsClick() {
		$e.route( 'panel/global/kit-settings' );
	}

	onLibraryClick() {
		$e.route( 'library/templates/pages' );
	}

	onHistoryClick() {
		$e.route( 'panel/global/history/actions' );
	}
}
