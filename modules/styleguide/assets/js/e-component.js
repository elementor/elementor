import * as commands from './commands/ui';
import * as commandsData from './commands/data';

require( './lib/dialog' );

export default class extends $e.modules.ComponentBase {
	activeKitId = 0;

	isStyleguideShown = false;

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

	defaultData() {
		return this.importCommands( commandsData );
	}

	initModal() {
		let modal;

		this.getModal = () => {
			if ( modal ) {
				return modal;
			}

			modal = elementorCommon.dialogsManager.createWidget( 'styleguide', {
				id: 'e-styleguide-preview-dialog',
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
	 * Show the Styleguide Preview.
	 * If skipPreferences is true, it will not check the User Preferences before showing the dialog.
	 *
	 * @param {boolean} skipPreferencesCheck
	 */
	showStyleguidePreview( skipPreferencesCheck = false ) {
		if ( this.isStyleguideShown || ( ! skipPreferencesCheck && ! elementor.getPreferences( 'enable_styleguide_preview' ) ) ) {
			return;
		}

		this.getPreviewFrame().postMessage(
			{ name: 'elementor/styleguide/preview/show' },
			'*',
		);
		this.getModal().getElements( 'widget' ).removeClass( 'e-hidden' );
		this.isStyleguideShown = true;
	}

	/**
	 * Hide the Styleguide Preview.
	 */
	hideStyleguidePreview() {
		this.getPreviewFrame().postMessage(
			{ name: 'elementor/styleguide/preview/hide' },
			'*',
		);
		this.getModal().getElements( 'widget' ).addClass( 'e-hidden' );
		this.isStyleguideShown = false;
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

	/**
	 * Check if the current script context is the Editor.
	 *
	 * @return {boolean}
	 */
	isInEditor() {
		return !! window.elementor;
	}

	/**
	 * Get the Preview Frame.
	 *
	 * @return {Window}
	 */
	getPreviewFrame() {
		return this.isInEditor()
			? elementor.$preview[ 0 ].contentWindow
			: window;
	}
}
