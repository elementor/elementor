module.exports = elementorModules.Module.extend( {
	loaderTab: null,
	onInit() {
		elementor.channels.editor.on( 'pluginActions', this.handlePluginAction.bind( this ) );
	},

	handlePluginAction( element ) {
		const eventData = element?.model.get( 'plugin_action' );
		if ( ! eventData || ! eventData?.action ) {
			return;
		}
		switch ( eventData.action ) {
			case 'install':
				this.install( eventData );
				break;
			case 'activate':
				this.activate( eventData );
				break;
			case 'installAndActivate':
				this.installAndActivate( eventData );
				break;
		}
	},

	async asyncFetch( url ) {
		const response = await fetch( url );
		return response;
	},

	async install( url ) {
		const installResponse = await this.asyncFetch( url );
		return installResponse;
	},

	async activate( eventData ) {
		if ( ! eventData ) {
			return;
		}

		if ( eventData?.loaderTab ) {
			this.showLoaderTab( eventData?.installText ?? eventData?.loaderTitle );
		}
		const activateResponse = await this.asyncFetch( eventData.url.replaceAll( '&amp;', '&' ) );
		const activateBody = await activateResponse.text();
		if ( this.requestHasErrors( activateBody ) ) {
			return this.handleError( 'Plugin activation failed. Please try again.' );
		}
		this.handleFollowLinkAndRefresh( eventData );
	},

	async installAndActivate( eventData ) {
		if ( ! eventData ) {
			return;
		}
		if ( eventData?.loaderTab ) {
			this.showLoaderTab( eventData?.installText ?? eventData?.loaderTitle );
		}

		if ( eventData?.preInstallCampaign ) {
			this.handlePreInstallCampaign( eventData?.preInstallCampaign );
		}

		const installResponse = await this.asyncFetch( eventData.url.replaceAll( '&amp;', '&' ) );
		const installBody = await installResponse.text();
		if ( this.requestHasErrors( installBody ) ) {
			return this.handleError( 'Plugin installation failed. Please try again.' );
		}
		this.updateLoaderHeading( eventData?.activateText ?? eventData?.loaderTitle );
		const activateLink = this.getActivateLink( installBody, eventData );
		if ( false === activateLink ) {
			this.handleError( 'Plugin activation link not found. Please try again.' );
		}
		const activateResponse = await this.asyncFetch( activateLink.replaceAll( '&amp;', '&' ) );
		const activateBody = await activateResponse.text();
		if ( this.requestHasErrors( activateBody ) ) {
			return this.handleError( 'Plugin activation failed. Please try again.' );
		}

		this.handleFollowLinkAndRefresh( eventData );
	},

	handlePreInstallCampaign( campaign ) {
		if ( campaign?.action ) {
			elementorCommon.ajax.addRequest( campaign.action, { data: { ...campaign.data } } );
		}
	},

	handleError( errorMessage ) {
		this.hideLoaderTab();
		// eslint-disable-next-line no-alert
		return alert( errorMessage );
	},

	handleFollowLinkAndRefresh( eventData ) {
		if ( eventData?.followLink ) {
			this.loaderTab.location.href = eventData?.followLink;
			this.loaderTab.focus();
		} else {
			this.hideLoaderTab();
		}

		if ( eventData?.refresh ) {
			window.location.reload();
		}
	},

	requestHasErrors( body ) {
		return body.indexOf( 'error-page' ) > -1;
	},

	/**
	 * Open a new tab with a loading animation.
	 * @param {string} heading
	 */
	showLoaderTab( heading = 'Loading...' ) {
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
	<div id="heading" class="elementor-loading-title">${ heading }</div>
</div>
</div>
    </body>
</html>`;
		const winUrl = URL.createObjectURL(
			new Blob( [ winHtml ], { type: 'text/html' } ),
		);
		this.loaderTab = window.open( winUrl, '_blank' );
		try {
			this.loaderTab.blur();
		} catch ( error ) {}
		window.focus();
	},

	/**
	 * Close the loader tab if it exists.
	 * This is useful for cleaning up after the installation process.
	 */
	hideLoaderTab() {
		if ( this.loaderTab ) {
			this.loaderTab.close();
			this.loaderTab = null;
		}
	},

	getActivateLink( body, eventData ) {
		const pluginSlug = eventData?.pluginSlug;
		if ( ! pluginSlug ) {
			return false;
		}
		const base = `plugins.php?action=activate&amp;plugin=${ pluginSlug }`;
		if ( -1 === body.indexOf( base ) ) {
			return false;
		}
		return `${ base }${ body.split( base, 2 )[ 1 ].split( '"', 2 )[ 0 ] }`;
	},

	/**
	 * Update the heading text in the loader tab.
	 * @param {string} heading - The new heading text.
	 */
	updateLoaderHeading( heading ) {
		if ( this.loaderTab ) {
			const headingElement = this.loaderTab.document.getElementById( 'heading' );
			if ( headingElement ) {
				headingElement.innerText = heading;
			}
		}
	},
} );

