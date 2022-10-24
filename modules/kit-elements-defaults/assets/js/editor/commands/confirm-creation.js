export default class ConfirmCreation extends $e.modules.editor.CommandContainerBase {
	static introduction;
	static #introductionKey = 'kit_elements_defaults_create_dialog';

	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		if ( ! this.constructor.introduction ) {
			this.constructor.introduction = this.#createIntroduction();
			this.constructor.introduction.introductionViewed = !! elementor.config.user.introduction?.[ this.constructor.#introductionKey ];
		}

		const introduction = this.constructor.introduction;
		const dialog = introduction.getDialog();

		if ( introduction.introductionViewed ) {
			$e.run( 'kit-elements-defaults/create', { container } );

			return;
		}

		// Need the replace the confirm callback, because the introduction modal is a singleton and each run we have diffrent container.
		dialog.onConfirm = () => {
			// `getElements` return JQuery object.
			if ( dialog.getElements( 'checkbox-dont-show-again' ).prop( 'checked' ) ) {
				introduction.setViewed();
			}

			$e.run( 'kit-elements-defaults/create', { container } );
		};

		introduction.show();
	}

	#createIntroduction() {
		const dialogId = 'e-kit-elements-defaults-create-dialog';

		const introduction = new elementorModules.editor.utils.Introduction( {
			introductionKey: this.constructor.#introductionKey,
			dialogType: 'confirm',
			dialogOptions: {
				id: dialogId,
				headerMessage: __( 'Sure you want to change default settings?', 'elementor' ),
				message: __( 'Your changes will automatically apply to all future use of this widget.', 'elementor' ) +
					'<br/><br/>' +
					__( 'Note: Your new default settings can include sensitive information such as API key, CSS ID, and more.', 'elementor' ),
				effects: {
					show: 'fadeIn',
					hide: 'fadeOut',
				},
				hide: {
					onBackgroundClick: true,
				},
				strings: {
					confirm: __( 'Save', 'elementor' ),
					cancel: __( 'Cancel', 'elementor' ),
				},
			},
		} );

		const { checkbox, label } = this.#createCheckboxAndLabel( dialogId );
		introduction.getDialog().addElement( 'checkbox-dont-show-again', checkbox );
		introduction.getDialog().getElements( 'message' )?.append?.( label ); // `getElements` return JQuery object.

		return introduction;
	}

	#createCheckboxAndLabel( dialogId ) {
		const checkboxId = `${ dialogId }-dont-show-again`;

		const checkbox = document.createElement( 'input' );

		checkbox.type = 'checkbox';
		checkbox.name = checkboxId;
		checkbox.id = checkboxId;
		checkbox.checked = true;

		const label = document.createElement( 'label' );

		label.htmlFor = checkboxId;
		label.textContent = __( 'Do not show this message again', 'elementor' );
		label.prepend( checkbox );

		return { checkbox, label };
	}
}
