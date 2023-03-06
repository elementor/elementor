import * as commands from './commands';

export default class extends $e.modules.ComponentBase {
	activeKitId = 0;

	constructor( args ) {
		super( args );

		const config = window.elementorStyleguideConfig;

		if ( ! config ) {
			return;
		}

		elementor.on( 'preview:loaded', () => {
			this.activeKitId = config.activeKitId;

			if ( elementor.documents.getCurrentId() === this.activeKitId ) {
				return;
			}

			this.initModal();
			this.getModal().show();
		} );
	}

	getNamespace() {
		return 'preview/styleguide';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	initModal() {
		let modal;

		this.getModal = () => {
			if ( modal ) {
				return modal;
			}

			modal = elementorCommon.dialogsManager.createWidget( 'styleguide-preview', {
				id: 'e-styleguide-preview',
				className: 'e-hidden',
				message: `<div class="elementor-${ this.activeKitId } e-styleguide-preview-root"></div>`,
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

	/**
	 * Show the Style Guide Preview.
	 * If skipPreferences is true, it will not check the User Preferences before showing the dialog.
	 *
	 * @param {boolean} skipPreferencesCheck
	 */
	showStyleguidePreview( skipPreferencesCheck = false ) {
		if ( ! skipPreferencesCheck && ! elementor.getPreferences( 'enable_styleguide_preview' ) ) {
			return;
		}

		this.getModal().getElements( 'widget' ).removeClass( 'e-hidden' );
		this.getModal().show();
	}

	/**
	 * Hide the Style Guide Preview.
	 */
	hideStyleguidePreview() {
		this.getModal().hide();
	}

	/**
	 * Update the User Preferences to enable/disable the Style Guide Preview.
	 * Triggered on switcher change at Global Colors / Global Typography panels.
	 *
	 * @param {Array} options
	 */
	enableStyleguidePreview( options ) {
		if ( options.value ) {
			this.showStyleguidePreview( true );
		} else {
			this.hideStyleguidePreview();
		}

		$e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				enable_styleguide_preview: options.value,
			},
			options: {
				external: true,
			},
		} );
	}
}
