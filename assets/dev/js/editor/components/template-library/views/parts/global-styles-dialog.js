export function showGlobalStylesDialog() {
	return new Promise( ( resolve, reject ) => {
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
				setupDialogEventListeners( dialog, resolve, reject );
			},
			onHide: () => {
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

	$matchRadio.on( 'change', () => {
		$checkboxContainer.hide();
	} );

	$keepRadio.on( 'change', () => {
		$checkboxContainer.show();
	} );

	$insertBtn.on( 'click', () => {
		let mode;

		if ( $matchRadio.is( ':checked' ) ) {
			mode = 'match_site';
		} else if ( $createCheckbox.is( ':checked' ) ) {
			mode = 'keep_create';
		} else {
			mode = 'keep_flatten';
		}

		dialog.hide();
		resolve( { mode } );
	} );

	$cancelBtn.on( 'click', () => {
		dialog.hide();
		reject( new Error( 'User cancelled' ) );
	} );
}

export default showGlobalStylesDialog;
