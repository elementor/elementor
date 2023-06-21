export default class extends elementorModules.Module {
	introductionMap = null;

	constructor( ...args ) {
		super( ...args );

		this.initDialog();
	}

	setIntroductionMap( map ) {
		this.introductionMap = map;
	}

	getIntroductionMap() {
		return this.introductionMap || elementor.config.user.introduction;
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

	get introductionViewed() {
		const introductionKey = this.getSettings( 'introductionKey' );

		return this.getIntroductionMap()[ introductionKey ];
	}

	set introductionViewed( isViewed ) {
		const introductionKey = this.getSettings( 'introductionKey' );

		this.getIntroductionMap()[ introductionKey ] = isViewed;
	}

	async setViewed() {
		this.introductionViewed = true;

		return new Promise( ( resolve, reject ) => {
			elementorCommon.ajax.addRequest( 'introduction_viewed', {
				data: {
					introductionKey: this.getSettings( 'introductionKey' ),
				},
				success: resolve,
				error: reject,
			} );
		} );
	}
}
