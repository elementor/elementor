export default class TopBar extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-top-bar';
	}

	className() {
		return 'e-responsive-top-bar';
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
			breakpointSettingsButton: prefix + 'bar__settings-button',
		};
	}

	events() {
		return {
			click: 'onClick',
			'change @ui.switcherOption': 'onBreakpointSelected',
			'click @ui.closeButton': 'onCloseButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
		};
	}

	initialize() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
	}

	onDeviceModeChange() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			$currentDeviceSwitcherOption = this.ui.switcherOption.filter( '[value=' + currentDeviceMode + ']' );

		if ( ! $currentDeviceSwitcherOption.prop( 'checked' ) ) {
			$currentDeviceSwitcherOption.prop( 'checked', true );
		}
	}

	onBreakpointSelected( e ) {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			selectedDeviceMode = e.target.value;

		if ( currentDeviceMode !== selectedDeviceMode ) {
			elementor.changeDeviceMode( selectedDeviceMode );
		}
	}

	onBreakpointSettingsOpen() {
		$e.run( 'editor/documents/switch', {
			id: elementor.config.kit_id,
			mode: 'autosave',
		} )
			.then( () => $e.route( 'panel/global/settings-layout' ) )
			// TODO: Replace with a standard routing solution once one is available
			.then( () => jQuery( '.elementor-control-section_breakpoints' ).trigger( 'click' ) );
	}

	onCloseButtonClick() {
		elementor.exitDeviceMode();
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
