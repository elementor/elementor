export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.initDialog();
	}

	getDefaultSettings() {
		return {
			dialogType: 'buttons',
			dialogOptions: {
				effects: {
					hide: 'hide',
					show: 'show',
				},
				hide: {
					onBackgroundClick: false,
				},
			},
		};
	}

	initDialog() {
		let dialog;

		this.getDialog = () => {
			if ( ! dialog ) {
				const settings = this.getSettings();

				dialog = elementorCommon.dialogsManager.createWidget( settings.dialogType, settings.dialogOptions );

				if ( settings.onDialogInitCallback ) {
					settings.onDialogInitCallback.call( this, dialog );
				}
			}

			return dialog;
		};
	}

	show( target ) {
		if ( this.introductionViewed ) {
			return;
		}

		const dialog = this.getDialog();

		if ( target ) {
			dialog.setSettings( 'position', {
				of: target,
			} );
		}

		dialog.show();
	}

	setViewed() {
		this.introductionViewed = true;

		elementorCommon.ajax.addRequest( 'introduction_viewed', {
			data: {
				introductionKey: this.getSettings( 'introductionKey' ),
			},
		} );
	}
}
