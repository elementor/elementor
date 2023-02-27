const revertButton = document.getElementById( 'elementor-import-export__revert_kit' );

if ( revertButton ) {
	revertButton.addEventListener( 'click', ( event ) => {
		event.preventDefault();

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'Sure you want to make these changes?', 'elementor' ),
			message: __( 'Removing assets or changing your site settings can drastically change the look of your website.', 'elementor' ),
			strings: {
				confirm: __( 'Yes', 'elementor' ),
				cancel: __( 'No, go back', 'elementor' ),
			},
			onConfirm() {
				location.href = revertButton.href;
			},
		} ).show();
	} );
}
