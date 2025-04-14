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
			const spinner = document.createElement( 'span' );
			spinner.setAttribute( 'class', ' elementor-control-spinner' );
			this.ui.action1[ 0 ].appendChild( spinner );
			this.ui.action1[ 0 ].setAttribute( 'disabled', true );

			const uri = options.url.replaceAll( '&amp;', '&' );
			if ( 'fetch' === options.target ) {
				const asyncFetch = async ( url ) => {
					const response = await fetch( url );
					return response;
				};
				const getActivateLink = ( body ) => {
					return 'plugins.php?action=activate' + body.split( 'plugins.php?action=activate', 2 )[ 1 ].split( '"', 2 )[ 0 ];
				};
				const runInstalllAndActivate = async () => {
					const winHtml = `<!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <style>
.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.wrapper {
	display: flex;
	justify-content: space-around;
	margin-top: 100px;
}
</style>
<div class="wrapper">
<div class="loader"></div>
</div>
        </body>
    </html>`;
					const winUrl = URL.createObjectURL(
						new Blob( [ winHtml ], { type: 'text/html' } ),
					);
					const adminWindow = window.open( winUrl, '_blank' );
					adminWindow.blur();
					window.focus();
					const installResponse = await asyncFetch( uri );
					const installBody = await installResponse.text();
					const activateResponse = await asyncFetch( getActivateLink( installBody ).replaceAll( '&amp;', '&' ) );
					adminWindow.location.href = '/wp-admin/admin.php?page=accessibility-settings';
					adminWindow.focus();
				};
				return runInstalllAndActivate();
			}
			if ( 'iframe' === options.target ) {
				const frame = document.createElement( 'iframe' );
				frame.setAttribute( 'id', 'elementor-notice-iframe' );
				window.document.body.appendChild( frame );
				const iframeDoc = frame.contentDocument || frame.contentWindow.document;
				let phase = 'install';
				const checkIframeLoaded = () => {
					switch ( phase ) {
						case 'install':
							// Check if loading is complete
							const activateLink = frame?.contentDocument?.body?.querySelector( '[href^="plugins.php?action=activate"]' );
							if ( 'complete' === iframeDoc.readyState && activateLink ) {
								frame.contentWindow.onload = () => {
									phase = 'activate';
									frame.src = activateLink.getAttribute( 'href' );
									window.setTimeout( () => {
										checkIframeLoaded();
									}, 500 );
								};
								return;
							}
							break;
						case 'activate':
							if ( 'complete' === iframeDoc.readyState ) {
								frame.contentWindow.onload = () => {
									window.location.href = '/wp-admin/admin.php?page=accessibility-settings';
									// Window.document.body.removeChild( frame );
								};
							}
							break;
					}

					// If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
					window.setTimeout( () => {
						checkIframeLoaded();
					}, 500 );
				};
				frame.src = uri;
				window.setTimeout( () => {
					checkIframeLoaded();
				}, 500 );
				return;
			}
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
