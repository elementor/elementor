export default class extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.initDialog();
	}

	initDialog() {
		let dialog;

		this.getDialog = () => {
			if ( ! dialog ) {
				const options = jQuery.extend( {
					effects: {
						hide: 'hide',
						show: 'show',
					},
					hide: {
						onBackgroundClick: false,
					},
				}, this.getSettings( 'dialogOptions' ) );

				dialog = elementorCommon.dialogsManager.createWidget( 'buttons', options );

				const onInitCallback = this.getSettings( 'onDialogInitCallback' );

				if ( onInitCallback ) {
					onInitCallback.call( this, dialog );
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

		dialog.setSettings( 'position', {
			of: target,
		} );

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
