var ControlBaseView = require( 'elementor-controls/base' );

module.exports = ControlBaseView.extend( {

	ui() {
		const ui = ControlBaseView.prototype.ui.apply( this, arguments );

		ui.action1 = '.e-btn-1';
		ui.action2 = '.e-btn-2';
		ui.dismissButton = '.elementor-control-notice-dismiss';

		return ui;
	},

	events: {
		'click @ui.action1': 'onButton1Click',
		'click @ui.action2': 'onButton2Click',
		'click @ui.dismissButton': 'onDismissButtonClick',
	},

	maybeHandleLinkEvent( eventName ) {
		if ( ! eventName || ! eventName.startsWith( 'openLink#' ) ) {
			return;
		}

		let linkOptions;
		try {
			linkOptions = atob( eventName.split( '#', 2 )[ 1 ] );
		} catch ( e ) {
			return;
		}

		if ( ! linkOptions ) {
			return;
		}

		try {
			const options = JSON.parse( linkOptions );
			if ( ! options ) {
				return;
			}

			const uri = options.url.replaceAll( '&amp;', '&' );

			if ( '_blank' === options.target ) {
				window.open( uri, '_blank' );
			} else {
				window.location.href = uri;
			}
		} catch ( e ) {

		}
	},

	onButton1Click() {
		const eventName = this.model.get( 'button_event' );
		this.maybeHandleLinkEvent( eventName );
		elementor.channels.editor.trigger( eventName, this );
	},

	onButton2Click() {
		const eventName = this.model.get( 'button_event' );
		this.maybeHandleLinkEvent( eventName );
		elementor.channels.editor.trigger( eventName, this );
	},

	getDismissId() {
		const controlName = this.model.get( 'name' );
		const elementType = 'widget' === this.options?.element?.model?.attributes?.elType
			? this.options?.element?.model?.attributes?.widgetType
			: this.options?.element?.model?.attributes?.elType;

		return `${ elementType }-${ controlName }`;
	},

	onDismissButtonClick() {
		const dismissId = this.getDismissId();

		elementorCommon.ajax.addRequest( 'dismissed_editor_notices', {
			data: {
				dismissId,
			},
			success: () => {
				this.$el.remove();
				const dismissedNotices = elementor?.config?.user?.dismissed_editor_notices ? [ ...elementor.config.user.dismissed_editor_notices ] : [];
				elementor.config.user.dismissed_editor_notices = [ ...dismissedNotices, dismissId ];
			},
		} );
	},

	templateHelpers() {
		const controlData = ControlBaseView.prototype.templateHelpers.apply( this, arguments );
		const dismissedNotices = elementor?.config?.user?.dismissed_editor_notices ? [ ...elementor.config.user.dismissed_editor_notices ] : [];
		const dismissId = this.getDismissId();

		controlData.data.shouldRenderNotice = ! dismissedNotices.includes( dismissId );

		return controlData;
	},
} );
