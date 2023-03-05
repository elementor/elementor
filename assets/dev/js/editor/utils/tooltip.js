import Introduction from './introduction';

export default class extends Introduction {
	introductionViewed = false;

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
					onOutsideClick: true,
					onBackgroundClick: true,
					onEscKeyPress: true,
				},
				position: {
					my: ( elementorCommon.config.isRTL ? 'right' : 'left' ) + '+5 top',
				},
			},
		};
	}

	initDialog() {
		if ( ! this.dialog ) {
			const settings = this.getSettings();

			this.dialog = elementorCommon.dialogsManager.createWidget( settings.dialogType, settings.dialogOptions );
		}
	}

	setTitle( title ) {
		const elements = this.dialog.getElements();
		elements.$title.text( title );
	}

	setContent( content ) {
		this.dialog.setMessage( content )
	}

	setButton( buttonOptions ) {
		if ( buttonOptions ) {
			this.dialog.addButton( {
				name: 'action',
				text: buttonOptions.text,
				classes: buttonOptions.classes.join( ' ' ),
				callback: () => buttonOptions.callback,
			} );
		}
	}

	show( options ) {
		if ( this.introductionViewed ) {
			return;
		}

		this.isActive = true;

		const inlineStartKey = elementorCommon.config.isRTL ? 'left' : 'right';

		if ( options?.targetElement ) {
			this.dialog.setSettings( 'position', {
				of: options.targetElement,
				at: `${ inlineStartKey }${ options.position.inlineStart || '' } top${ options.position.blockStart || '' }`,
			} );
		}

		this.dialog.show();
	}

	hide() {
		this.dialog.hide();
	}
}
