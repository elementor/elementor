import CommandBase from 'elementor-api/modules/command-base';

export class Back extends CommandBase {
	confirmDialog = null;

	apply() {
		const panelHistory = $e.routes.getHistory( 'panel' );

		// Don't go back if no where.
		if ( 1 === panelHistory.length ) {
			this.getCloseConfirmDialog( event ).show();
			return;
		}

		return $e.routes.back( 'panel' );
	}

	getCloseConfirmDialog( event ) {
		if ( ! this.confirmDialog ) {
			const modalOptions = {
				id: 'elementor-kit-warn-on-close',
				headerMessage: __( 'Exit', 'elementor' ),
				message: __( 'Would you like to exit?', 'elementor' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: __( 'Exit', 'elementor' ),
					cancel: __( 'Cancel', 'elementor' ),
				},
				onConfirm: () => {
					$e.run( 'panel/global/close' );
				},
			};

			this.confirmDialog = elementorCommon.dialogsManager.createWidget( 'confirm', modalOptions );
		}

		this.confirmDialog.setSettings( 'hide', {
			onEscKeyPress: ! event,
		} );

		return this.confirmDialog;
	}
}

export default Back;
