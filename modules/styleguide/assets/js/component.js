import * as commands from './commands';

require( './lib/dialog' );

export default class extends $e.modules.ComponentBase {
	activeKitId = 0;

	isShown = false;

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
				className: 'elementor-hidden e-hidden',
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
		if ( this.isShown || ( ! skipPreferencesCheck && ! elementor.getPreferences( 'enable_styleguide_preview' ) ) ) {
			return;
		}

		this.getPreviewFrame().postMessage(
			{ name: 'elementor/styleguide/preview/show' },
			'*',
		);
		this.getModal().getElements( 'widget' ).removeClass( 'e-hidden' );
		this.isShown = true;
	}

	/**
	 * Hide the Style Guide Preview.
	 */
	hideStyleguidePreview() {
		this.getPreviewFrame().postMessage(
			{ name: 'elementor/styleguide/preview/hide' },
			'*',
		);
		this.getModal().getElements( 'widget' ).addClass( 'e-hidden' );
		this.isShown = false;
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

	isInEditor() {
		return !! window.elementor;
	}

	getPreviewFrame() {
		return this.isInEditor()
			? elementor.$preview[ 0 ].contentWindow
			: window;
	}
}
