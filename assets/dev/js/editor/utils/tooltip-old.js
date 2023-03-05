export default class extends elementorModules.Module {
	introductionViewed = false;

	constructor( ...args ) {
		super( ...args );

		this.initDialog();
	}

	getDefaultSettings() {
		return {
			dialogType: 'tooltip',
			dialogOptions: {
				id: 'elementor-element--tooltip__dialog',
				effects: {
					show: 'show',
					hide: 'hide',
				},
				hide: {
					onOutsideClick: false,
				},
				position: {
					my: ( elementorCommon.config.isRTL ? 'right' : 'left' ) + '+5 top',
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

				const elements = [];

				elements.$title = jQuery( '<div>', { id: 'elementor-element--tooltip__dialog__title' } );
				elements.$title.text( settings.dialogOptions.title );

				elements.$closeButton = jQuery( '<i>', { class: 'eicon-close' } );
				elements.$closeButton.on( 'click', () => dialog.hide() );

				elements.$header = dialog.getElements( 'header' );
				elements.$header.append(
					elements.$title,
					elements.$closeButton,
				);

				const buttonOptions = settings.dialogOptions.button;
				if ( buttonOptions ) {
					dialog.addButton( {
						name: 'action',
						text: buttonOptions.text,
						classes: buttonOptions.classes.join( ' ' ),
						callback: () => buttonOptions.callback,
					} );
				}

				dialog.setMessage( settings.dialogOptions.content )
			}

			return dialog;
		};
	}

	show( options ) {
		if ( this.introductionViewed ) {
			return;
		}

		const dialog = this.getDialog();

		const inlineStartKey = elementorCommon.config.isRTL ? 'left' : 'right';

		if ( options?.targetElement ) {
			dialog.setSettings( 'position', {
				of: options.targetElement,
				at: `${ inlineStartKey }${ options.position.inlineStart || '' } top${ options.position.blockStart || '' }`,
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
