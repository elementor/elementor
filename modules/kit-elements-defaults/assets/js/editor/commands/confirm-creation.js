export default class ConfirmCreation extends $e.modules.CommandBase {
	static #introductionModal;

	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		if ( ! this.constructor.#introductionModal ) {
			this.constructor.#introductionModal = this.createIntroductionModal( {
				onConfirm: () => $e.run( 'kit-elements-defaults/create', { container } ),
			} );
		}

		if ( this.constructor.#introductionModal.introductionViewed ) {
			$e.run( 'kit-elements-defaults/create', { container } );

			return;
		}

		this.constructor.#introductionModal.show();
	}

	createIntroductionModal( { onConfirm } ) {
		const introductionKey = 'kit_elements_defaults_create_dialog';

		const introductionModal = new elementorModules.editor.utils.Introduction( {
			introductionKey,
			dialogType: 'confirm',
			dialogOptions: {
				id: 'e-kit-elements-defaults-create-dialog',
				headerMessage: __( 'Sure you want to change default settings?', 'elementor' ),
				message: __(
					'Your changes will automatically apply to all future use of this widget. %s Note: Your new default settings can include sensitive information such as API key, CSS ID, and more. ',
					'elementor',
				).replace( '%s', '<br/><br/>' ),
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
				onConfirm() {
					if ( this.getElements( 'checkbox-dont-show-again' ).prop( 'checked' ) ) {
						introductionModal.setViewed();
					}

					onConfirm();
				},
			},
		} );

		const $checkbox = jQuery( '<input />', {
			type: 'checkbox',
			name: 'e-kit-elements-defaults-create-dialog-do-not-show-again',
			id: 'e-kit-elements-defaults-create-dialog-do-not-show-again',
			checked: true,
		} );

		const $label = jQuery( '<label />', {
			for: 'e-kit-elements-defaults-create-dialog-do-not-show-again',
			text: __( 'Do not show this message again', 'elementor' ),
			style: 'display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 15px;',
		} ).prepend( $checkbox );

		introductionModal.getDialog().addElement( 'checkbox-dont-show-again', $checkbox );
		introductionModal.getDialog().getElements( 'message' )?.append?.( $label );

		introductionModal.introductionViewed = elementor.config.user.introduction?.[ introductionKey ] || false;

		return introductionModal;
	}
}
