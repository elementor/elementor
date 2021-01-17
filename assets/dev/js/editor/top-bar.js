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
		const prefix = '.e-mq-';

		return {
			switcherOption: prefix + 'switcher__option',
			switcher: prefix + 'switcher',
			closeButton: prefix + 'bar__close-button',
			optionsMenuToggle: prefix + 'bar__options-button',
		};
	}

	events() {
		return {
			'change @ui.switcherOption': 'onBreakpointSelected',
			'click @ui.closeButton': 'onCloseButtonClick',
		};
	}

	onBreakpointSelected( e ) {
		const selectedBreakpoint = jQuery( e.target ).attr( 'value' );
		elementor.changeDeviceMode( selectedBreakpoint );
	}

	onChange() {
		const changeCallback = this.getOption( 'change' );

		if ( changeCallback ) {
			changeCallback();
		}
	}

	onClick() {
		const clickCallback = this.getOption( 'click' );

		if ( clickCallback ) {
			clickCallback();
		}
	}
}
