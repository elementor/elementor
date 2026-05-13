export function showGlobalStylesDialog() {
	return new Promise( ( resolve, reject ) => {
		let settled = false;

		const dialog = elementorCommon.dialogsManager.createWidget( 'lightbox', {
			id: 'elementor-global-styles-dialog',
			headerMessage: '',
			message: wp.template( 'elementor-global-styles-dialog' )(),
			position: {
				my: 'center',
				at: 'center',
			},
			hide: {
				onBackgroundClick: false,
			},
			onShow: () => {
				setupDialogEventListeners( dialog, ( payload ) => {
					if ( settled ) {
						return;
					}

					settled = true;
					resolve( payload );
					dialog.hide();
				}, ( error ) => {
					if ( settled ) {
						return;
					}

					settled = true;
					reject( error );
					dialog.hide();
				} );
			},
			onHide: () => {
				if ( settled ) {
					return;
				}

				settled = true;
				reject( new Error( 'Dialog closed' ) );
			},
		} );

		dialog.show();
	} );
}

function setupDialogEventListeners( dialog, resolve, reject ) {
	const $content = dialog.getElements( 'message' );
	const $matchRadio = $content.find( '#elementor-global-styles-match' );
	const $keepRadio = $content.find( '#elementor-global-styles-keep' );
	const $createCheckbox = $content.find( '#elementor-global-styles-create' );
	const $checkboxContainer = $content.find( '.elementor-global-styles-dialog__checkbox-container' );
	const $insertBtn = $content.find( '#elementor-global-styles-insert' );
	const $cancelBtn = $content.find( '#elementor-global-styles-cancel' );

	$matchRadio.off( '.elementorGlobalStyles' ).on( 'change.elementorGlobalStyles', () => {
		$checkboxContainer.hide();
	} );

	$keepRadio.off( '.elementorGlobalStyles' ).on( 'change.elementorGlobalStyles', () => {
		$checkboxContainer.show();
	} );

	$insertBtn.off( '.elementorGlobalStyles' ).on( 'click.elementorGlobalStyles', () => {
		let mode;

		if ( $matchRadio.is( ':checked' ) ) {
			mode = 'match_site';
		} else if ( $createCheckbox.is( ':checked' ) ) {
			mode = 'keep_create';
		} else {
			mode = 'keep_flatten';
		}

		resolve( { mode } );
	} );

	$cancelBtn.off( '.elementorGlobalStyles' ).on( 'click.elementorGlobalStyles', () => {
		reject( new Error( 'User cancelled' ) );
	} );
}

export default showGlobalStylesDialog;
