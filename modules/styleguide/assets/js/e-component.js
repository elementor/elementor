import * as commands from './commands';
import Switcher from './controls/switcher';

export default class extends $e.modules.ComponentBase {
	constructor( args ) {
		super( args );

		elementor.addControlView( 'global-style-switcher', Switcher );

		this.registerStyleguideDialogType();

		elementor.once( 'preview:loaded', () => {
			this.initModal();
		} );
	}

	getNamespace() {
		return 'preview/styleguide';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	registerStyleguideDialogType() {
		DialogsManager.addWidgetType( 'styleguide', DialogsManager.getWidgetType( 'lightbox' ).extend( 'alert', {
			buildWidget() {
				DialogsManager.getWidgetType( 'lightbox' ).prototype.buildWidget.apply( this, arguments );

				var $widgetContent = this.addElement( 'widgetContent' ),
					elements = this.getElements();

				$widgetContent.append( elements.message );

				elements.widget.html( $widgetContent );
			},
		} ) );
	}

	initModal() {
		let modal;

		this.getModal = () => {
			if ( modal ) {
				return modal;
			}

			modal = elementorCommon.dialogsManager.createWidget( 'styleguide', {
				id: 'e-styleguide-preview-dialog',
				message: `<div class="e-styleguide-preview-root"></div>`,
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
		if ( this.getModal().isVisible() || ( ! skipPreferencesCheck && ! elementor.getPreferences( 'enable_styleguide_preview' ) ) ) {
			return;
		}

		this.getPreviewFrame().postMessage(
			{ name: 'elementor/styleguide/preview/show' },
			'*',
		);

		this.getModal().show();
	}

	/**
	 * Hide the Styleguide Preview.
	 */
	hideStyleguidePreview() {
		this.getPreviewFrame().postMessage(
			{ name: 'elementor/styleguide/preview/hide' },
			'*',
		);

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
