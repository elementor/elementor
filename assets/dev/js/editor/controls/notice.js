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
			#elementor-loading {
			    position: fixed;
			    inset: 0;
			    background: #fff;
			    z-index: 9999;
			}
			.elementor-loader-wrapper {
			    position: absolute;
			    top: 50%;
			    left: 50%;
			    transform: translate(-50%, -50%);
			    width: 300px;
			    display: flex;
			    flex-direction: column;
			    align-items: center;
			    gap: 30px;
			}
			.elementor-loader {
			    border-radius: 50%;
			    padding: 40px;
			    height: 150px;
			    width: 150px;
			    background-color: #E6E8EB;
			    box-sizing: border-box;
			    box-shadow: 2px 2px 20px 4px rgba(0, 0, 0, 0.02);
			}
			.elementor-loader-boxes {
			    height: 100%;
			    width: 100%;
			    position: relative;
			    margin: 0;
			    padding: 0;
			    box-sizing: border-box;
			}
			.elementor-loader-box {
			    position: absolute;
			    background-color: #3f444b;
			    animation: load 1.8s linear infinite;
			}
			.elementor-loader-box:nth-of-type(1) {
			    width: 20%;
			    height: 100%;
			    left: 0;
			    top: 0;
			}
			.elementor-loader-box:nth-of-type(2) {
			    top: 0;
			    animation-delay: calc(1.8s / 4 * -1);
			}
			.elementor-loader-box:nth-of-type(3) {
			    top: 40%;
			    animation-delay: calc(1.8s / 4 * -2);
			}
			.elementor-loader-box:nth-of-type(4) {
			    bottom: 0;
			    animation-delay: calc(1.8s / 4 * -3);
			}
			.elementor-loader-box:not(:nth-of-type(1)) {
			    right: 0;
			    height: 20%;
			    width: 60%;
			}
			.elementor-loading-title {
			    color: #515962;
			    text-align: center;
			    text-transform: uppercase;
			    letter-spacing: 7px;
			    text-indent: 7px;
			    font-size: 10px;
			    width: 100%;
			}
			@keyframes load {
				0% { opacity: .3; }
				50% { opacity: 1; }
				100% { opacity: .3; }
			}
		</style>
		<div id="elementor-loading">
<div class="elementor-loader-wrapper">
	<div class="elementor-loader" aria-hidden="true">
		<div class="elementor-loader-boxes">
			<div class="elementor-loader-box"></div>
			<div class="elementor-loader-box"></div>
			<div class="elementor-loader-box"></div>
			<div class="elementor-loader-box"></div>
		</div>
	</div>
	<div class="elementor-loading-title">Installing Ally</div>
</div>
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
