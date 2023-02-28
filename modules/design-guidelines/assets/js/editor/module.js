require( '../lib/dialog' );

class Module extends elementorModules.editor.utils.Module {
	activeKitId = 0;

	onInit() {
		const config = window.elementorDesignGuidelinesConfig;

		if ( ! config ) {
			return;
		}

		elementor.on( 'preview:loaded', () => {
			this.activeKitId = config.activeKitId;

			if ( elementor.documents.getCurrentId() === this.activeKitId ) {
				return;
			}

			// TODO 21/02/2023 : get active kit id from the server.

			this.initModal();
			this.getModal().show();
		} );

		elementor.hooks.addAction( 'elementor/preview/style-guide/colors', this.showStyleguidePreview.bind( this ) );
		elementor.hooks.addAction( 'elementor/preview/style-guide/typography', this.showStyleguidePreview.bind( this ) );

		elementor.hooks.addAction( 'elementor/preview/style-guide/hide', this.hideStyleguidePreview.bind( this ) );

		elementor.hooks.addAction( 'elementor/preview/style-guide/enable', this.enableStyleguidePreview.bind( this ) );
	}

	initModal() {
		let modal;

		this.getModal = () => {
			if ( modal ) {
				return modal;
			}

			modal = elementorCommon.dialogsManager.createWidget( 'styleguide-preview', {
				id: 'e-design-guidelines',
				className: 'e-hidden',
				message: `<div class="elementor-${ this.activeKitId } e-design-guidelines-root"></div>`,
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

	showStyleguidePreview( skipPreferencesCheck = false ) {
		if ( ! skipPreferencesCheck && ! elementor.getPreferences( 'enable_style_guide_preview' ) ) {
			return;
		}

		this.getModal().getElements( 'widget' ).removeClass( 'e-hidden' );
		this.getModal().show();
	}

	hideStyleguidePreview() {
		this.getModal().hide();
	}

	enableStyleguidePreview( options ) {
		if ( options.value ) {
			this.showStyleguidePreview( true );
		} else {
			this.hideStyleguidePreview();
		}

		$e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_style_guide_preview: options.value,
			},
			options: {
				external: true,
			},
		} );
	}
}

new Module();
