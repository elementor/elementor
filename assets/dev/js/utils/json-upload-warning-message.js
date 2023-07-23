const genericMessageIntroductionKey = 'upload_json_warning_generic_message';
/**
 * @type {import('../utils/introduction').default | null}
 */
let genericWarningModal = null;

export function showJsonUploadWarningMessageIfNeeded( { introductionMap, IntroductionClass, waitForSetViewed = false } ) {
	if ( ! genericWarningModal ) {
		genericWarningModal = createGenericWarningModal( IntroductionClass );
	}

	genericWarningModal.setIntroductionMap( introductionMap );

	if ( genericWarningModal.introductionViewed ) {
		return Promise.resolve();
	}

	const dialog = genericWarningModal.getDialog();

	return new Promise( ( resolve, reject ) => {
		dialog.onHide = () => {
			// When closing the dialog (esc, click on background, etc.) we need to reject the promise.
			reject();
		};

		dialog.onConfirm = async () => {
			if ( dialog.getElements( 'checkbox-dont-show-again' ).prop( 'checked' ) ) {
				if ( waitForSetViewed ) {
					await genericWarningModal.setViewed();
				} else {
					genericWarningModal.setViewed();
				}
			}

			// Hack: we need to resolve the promise and then hide it manually, to avoid rejecting the promise.
			// this because when closing the dialog (esc, click on background, etc.) it does not trigger `onCancel` method.
			resolve();

			dialog.hide();
		};

		dialog.onCancel = () => {
			dialog.hide();
		};

		genericWarningModal.show();
	} );
}

/**
 * @param {import('../utils/introduction').default.prototype.constructor} IntroductionClass
 *
 * @return {import('../utils/introduction').default}
 */
function createGenericWarningModal( IntroductionClass ) {
	const dialogId = 'e-generic-warning-modal-for-json-upload';

	const introduction = new IntroductionClass( {
		introductionKey: genericMessageIntroductionKey,
		dialogType: 'confirm',
		dialogOptions: {
			id: dialogId,
			headerMessage: __( 'Warning: JSON files may be unsafe', 'elementor' ),
			message: __( 'Uploading JSON files from unknown sources can be harmful and put your site at risk. For maximum safety, only install JSON files from trusted sources.', 'elementor' ),
			effects: {
				show: 'fadeIn',
				hide: 'fadeOut',
			},
			hide: {
				onBackgroundClick: true,
				onButtonClick: false,
			},
			strings: {
				confirm: __( 'Continue', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
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

	const label = document.createElement( 'label' );

	label.htmlFor = checkboxId;
	label.textContent = __( 'Do not show this message again', 'elementor' );
	label.style.display = 'block';
	label.style.marginTop = '20px';
	label.style.marginBottom = '20px';
	label.prepend( checkbox );

	return { checkbox, label };
}
