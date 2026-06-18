export default class extends elementorModules.Module {
	constructor() {
		super();

		this.dialog = null;
		this.onTrigger = this.onTrigger.bind( this );

		window.addEventListener( 'elementor/theme-builder-promotion/trigger', this.onTrigger );
	}

	destroy() {
		window.removeEventListener( 'elementor/theme-builder-promotion/trigger', this.onTrigger );
		this.dialog?.hide?.();
		this.dialog = null;
	}

	onTrigger( event ) {
		const scenario = event?.detail?.scenario;

		if ( ! scenario ) {
			return;
		}

		const introductionKey = this.getIntroductionKey( scenario );

		if ( ! introductionKey ) {
			return;
		}

		// If ( this.isViewed( introductionKey ) ) {
		// 	this.showAlert( scenario );
		// 	return;
		// }

		this.showDialog( scenario, introductionKey );
	}

	getIntroductionKey( scenario ) {
		if ( 'single_post' === scenario ) {
			return 'introduce_theme_builder_single_post_popup';
		}

		if ( 'single_product' === scenario ) {
			return 'introduce_theme_builder_single_product_popup';
		}

		if ( 'header_footer' === scenario ) {
			return 'introduce_theme_builder_header_footer_popup';
		}

		return null;
	}

	isViewed( introductionKey ) {
		return Boolean( elementor?.config?.user?.introduction?.[ introductionKey ] );
	}

	async setViewed( introductionKey ) {
		if ( ! elementor?.config?.user?.introduction ) {
			return;
		}

		elementor.config.user.introduction[ introductionKey ] = true;

		try {
			await elementorCommon.ajax.addRequest( 'introduction_viewed', {
				data: {
					introductionKey,
				},
			} );
		} catch {
			// Analytics gating should never break the user flow.
		}
	}

	getDialogContent( scenario ) {
		const assetBase = elementorCommon?.config?.urls?.assets || '';
		const imageUrl = assetBase + 'images/theme-builder-promotion/intro-single-post.png';

		if ( 'single_product' === scenario ) {
			return {
				title: __( 'Your store is growing.', 'elementor' ) + '<br />' + __( 'Your workflow should too.', 'elementor' ),
				body: __( 'With a Single Product theme, every new product automatically inherits your design, no rework, no drift.', 'elementor' ),
				imageUrl,
			};
		}

		if ( 'header_footer' === scenario ) {
			return {
				title: __( 'Your site is growing.', 'elementor' ) + '<br />' + __( 'Your workflow should too.', 'elementor' ),
				body: __( 'With Header & Footer templates, every new page automatically inherits your design, no rework, no drift.', 'elementor' ),
				imageUrl,
			};
		}

		return {
			title: __( 'Your site is growing.', 'elementor' ) + '<br />' + __( 'Your workflow should too.', 'elementor' ),
			body: __( 'With a Single Post theme, every new post automatically inherits your design, no rework, no drift.', 'elementor' ),
			imageUrl,
		};
	}

	openThemeBuilder() {
		try {
			$e.run( 'app/open' );
		} catch {
			// Fallback (should rarely happen).
			open( elementorCommon?.config?.home_url || '/', '_blank' );
		}
	}

	track( payload ) {
		try {
			elementorCommon?.eventsManager?.dispatchEvent?.( 'theme_builder_promotion', payload );
		} catch {
			// Silently fail — analytics should never break production functionality.
		}
	}

	showAlert( scenario ) {
		this.track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'popup_shown',
			target_type: 'popup',
			target_name: `introduce_theme_builder_${ scenario }_popup`,
			interaction_result: 'popup_viewd',
			target_location: 'editor',
			location_l1: scenario,
		} );

		elementor.notifications.showToast( {
			message: __( 'Tip: Speed up your workflow with Theme Builder.', 'elementor' ),
			buttons: [
				{
					name: 'open_theme_builder',
					text: __( 'Open Theme Builder', 'elementor' ),
					callback: () => {
						this.track( {
							app_type: 'editor',
							window_name: 'editor',
							interaction_type: 'click',
							target_type: 'button',
							target_name: 'open_theme_builder',
							interaction_result: 'opened_theme_builder',
							target_location: `introduce_theme_builder_${ scenario }_popup`,
							location_l1: 'open_theme_builder_button',
						} );

						this.openThemeBuilder();
					},
				},
			],
		} );
	}

	showDialog( scenario, introductionKey ) {
		const { title, body, imageUrl } = this.getDialogContent( scenario );
		const openThemeBuilderButtonStyle = [
			'background: var(--e-a-color-black)',
			'color: var(--e-a-color-white)',
			'border-radius: 12px',
			'font-size: 14px',
			'font-weight: 600',
			'line-height: 20px',
			'padding: 12px 24px',
			'min-height: 44px',
		].join( '; ' );

		this.track( {
			app_type: 'editor',
			window_name: 'editor',
			interaction_type: 'popup_shown',
			target_type: 'popup',
			target_name: `introduce_theme_builder_${ scenario }_popup`,
			interaction_result: 'popup_viewed',
			target_location: 'editor',
			location_l1: scenario,
		} );

		if ( ! this.dialog ) {
			this.dialog = elementorCommon.dialogsManager.createWidget( 'lightbox', {
				id: 'elementor-theme-builder-promotion-dialog',
				headerMessage: '',
				position: {
					my: 'center',
					at: 'center',
				},
				hide: {
					onBackgroundClick: false,
				},
			} );
		}

		const html = `
			<div style="display:flex; width: 893px; height: 432px; border-radius: 20px; overflow:hidden; background:#fff;">
				<div style="flex:0 0 416px; background: #f2f3f5; display:flex; align-items:center; justify-content:center;">
					<img src="${ imageUrl }" alt="theme builder promotion image" style="width:100%; height:100%; object-fit:cover;" />
				</div>
				<div style="flex:1; padding: 40px 40px 40px 32px; display:flex; flex-direction:column; justify-content:space-between;">
					<div>
						<div style="font-size:32px; line-height:42px; font-weight:700; color:#3f444b; margin: 40px 0 20px 0;">${ title }</div>
						<div style="font-size:16px; line-height:24px; color:#0c0d0e;">${ body }</div>
					</div>
					<div style="display:flex; justify-content:flex-end;">
						<button type="button" class="elementor-button" id="elementor-theme-builder-promotion-open" style="${ openThemeBuilderButtonStyle }">
							${ __( 'Open Theme Builder', 'elementor' ) }
						</button>
					</div>
				</div>
				<button type="button" id="elementor-theme-builder-promotion-close"aria-label="${ __( 'Close', 'elementor' ) }" style="color: black;position:absolute; top: 16px; right: 16px; background:transparent; border:0; font-size:22px; cursor:pointer;">x</button>
			</div>
		`;

		this.dialog.setMessage( html );
		this.dialog.show();

		const $message = this.dialog.getElements( 'message' );

		$message
			.off( '.themeBuilderPromotion' )
			.on( 'click.themeBuilderPromotion', '#elementor-theme-builder-promotion-open', async () => {
				this.track( {
					app_type: 'editor',
					window_name: 'editor',
					interaction_type: 'click',
					target_type: 'button',
					target_name: 'open_theme_builder',
					interaction_result: 'opened_theme_builder',
					target_location: `introduce_theme_builder_${ scenario }_popup`,
					location_l1: 'open_theme_builder_button',
				} );

				await this.setViewed( introductionKey );
				this.dialog.hide();
				this.openThemeBuilder();
			} )
			.on( 'click.themeBuilderPromotion', '#elementor-theme-builder-promotion-close', async () => {
				this.track( {
					app_type: 'editor',
					window_name: 'editor',
					interaction_type: 'click',
					target_type: 'button',
					target_name: 'cancel',
					interaction_result: 'cancel',
					target_location: `introduce_theme_builder_${ scenario }_popup`,
					location_l1: 'cancel_button',
				} );

				await this.setViewed( introductionKey );
				this.dialog.hide();
			} );
	}
}

