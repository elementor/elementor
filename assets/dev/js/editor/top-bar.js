export default class TopBar extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-top-bar';
	}

	className() {
		return 'e-responsive-top-bar';
	}

	events() {
		return {
			click: 'onClick',
		};
	}

	templateHelpers() {
		return {
			title: this.getOption( 'title' ),
			width: '',
			height: '',
			activeDevice: '',
		};
	}

	ui() {
		return {
			addNewSection: '.elementor-add-new-section',
			closeButton: '.elementor-add-section-close',
			addSectionButton: '.elementor-add-section-button',
			addTemplateButton: '.elementor-add-template-button',
			selectPreset: '.elementor-select-preset',
			presets: '.elementor-preset',
		};
	}

	events() {
		return {
			'click @ui.addSectionButton': 'onAddSectionButtonClick',
			'click @ui.addTemplateButton': 'onAddTemplateButtonClick',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.presets': 'onPresetSelected',
		};
	}

	behaviors() {
		return {
			contextMenu: {
				behaviorClass: require( 'elementor-behaviors/context-menu' ),
				groups: this.getContextMenuGroups(),
			},
		};
	}

	onClick() {
		const clickCallback = this.getOption( 'click' );

		if ( clickCallback ) {
			clickCallback();
		}
	}
}
