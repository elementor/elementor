class Module extends elementorModules.editor.utils.Module {
	activeKitId = 0;

	onInit() {
		const isStyleguidePreviewEnabled = elementor.getPreferences( 'enable_style_guide_preview' );
		const config = window.elementorDesignGuidelinesConfig;

		if ( ! config || ! isStyleguidePreviewEnabled ) {
			return;
		}

		elementor.on( 'preview:loaded', () => {
			this.activeKitId = config.activeKitId;

			if ( elementor.documents.getCurrentId() === this.activeKitId ) {
				return;
			}

			// TODO 21/02/2023 : get active kit id from the server.
			// TODO 21/02/2023 : enqueue styles in iframe somehow.

			this.initModal();
			this.getModal().show().hide();
		} );

		elementor.hooks.addAction( 'elementor/preview/style-guide/colors', this.showStyleguidePreview.bind( this ) );
		elementor.hooks.addAction( 'elementor/preview/style-guide/typography', this.showStyleguidePreview.bind( this ) );

		elementor.hooks.addAction( 'elementor/preview/style-guide/hide', this.hideStyleguidePreview.bind( this ) );
	}

	initModal() {
		let modal;

		this.getModal = () => {
			if ( modal ) {
				return modal;
			}

			modal = elementorCommon.dialogsManager.createWidget( 'fillscreen', {
				message: `<div class="elementor-${ this.activeKitId } e-design-guidelines-root" id="e-design-guidelines"></div>`,
				position: {
					my: 'center center',
					at: 'center center',
				},
				hide: {
					onOutsideClick: false,
					onEscKeyPress: false,
					onClick: false,
					onBackgroundClick: false,
				},
				container: elementor.$previewContents.find( 'body' ),
			} );

			return modal;
		};
	}

	showStyleguidePreview() {
		elementor.changeEditMode( 'picker' );
		this.getModal().show();
	}

	hideStyleguidePreview() {
		elementor.changeEditMode( 'edit' );
		this.getModal().hide();
	}
}

new Module();
