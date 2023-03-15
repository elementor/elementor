export const introductionKey = 'kit_elements_defaults_create_dialog';
export let introductionManager = null;

/**
 * A wrapper around Introduction class that allows to create a dialog only once,
 * + has specific logic for the "Do not show this message again" checkbox,
 * + the content for "save as default" feature.
 *
 * @param {Object}   config
 * @param {Function} config.onConfirm
 * @return {{show: (function(): *), doNotShowAgain: (boolean)}}
 */
export function getConfirmCreationDialog( { onConfirm } ) {
	if ( ! introductionManager ) {
		introductionManager = createIntroductionManager();
		introductionManager.introductionViewed = !! elementor.config.user.introduction?.[ introductionKey ];
	}

	const dialog = introductionManager.getDialog();

	dialog.onConfirm = () => {
		// `getElements` return JQuery object.
		if ( dialog.getElements( 'checkbox-dont-show-again' ).prop( 'checked' ) ) {
			introductionManager.setViewed();
		}

		onConfirm();
	};

	return {
		doNotShowAgain: !! introductionManager.introductionViewed,
		show: () => introductionManager.show(),
	};
}

export function removeConfirmCreationDialog() {
	introductionManager = null;
}

function createIntroductionManager() {
	const dialogId = 'e-kit-elements-defaults-create-dialog';

	const introduction = new elementorModules.editor.utils.Introduction( {
		introductionKey,
		dialogType: 'confirm',
		dialogOptions: {
			id: dialogId,
			headerMessage: __( 'Sure you want to change default settings?', 'elementor' ),
			// Translators: %1$s: Opening strong tag, %2$s: Closing strong tag.
			message: __( 'Your changes will automatically be saved for future uses of this element. %1$sNote:%2$s This includes sensitive information like emails, API keys, etc.', 'elementor' )
				.replace( '%1$s', '<strong>' )
				.replace( '%2$s', '</strong>' ),
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
			onShow() {
				this.getElements( 'checkbox-dont-show-again' )?.prop( 'checked', true );
			},
		},
	} );

	const { checkbox, label } = createCheckboxAndLabel( dialogId );

	introduction.getDialog().addElement( 'checkbox-dont-show-again', checkbox );
	introduction.getDialog().getElements( 'message' )?.append?.( label ); // `getElements` return JQuery object.

	return introduction;
}

function createCheckboxAndLabel( dialogId ) {
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
