export default class extends Marionette.Behavior {
	ui() {
		return {
			editButton: '.elementor-editor-element-edit',
		};
	}

	events() {
		return {
			'click @ui.editButton': 'show',
		};
	}

	initialize() {
		this.initIntroduction();
	}

	initIntroduction() {
		let introduction;

		this.getIntroduction = () => {
			if ( ! introduction ) {
				introduction = new elementorModules.editor.utils.Introduction( {
					introductionKey: 'rightClick',
					dialogOptions: {
						className: 'elementor-right-click-introduction',
						headerMessage: __( 'Meet Right Click', 'elementor' ),
						message: __( 'Now you can access all editing actions using right click.', 'elementor' ),
						iframe: elementor.$preview,
						position: {
							my: 'center top+5',
							at: 'center bottom',
							collision: 'fit',
						},
					},
					onDialogInitCallback: ( dialog ) => {
						dialog.addButton( {
							name: 'learn-more',
							text: __( 'Learn More', 'elementor' ),
							tag: 'div',
							callback: () => {
								open( elementor.config.help_right_click_url, '_blank' );
							},
						} );

						dialog.addButton( {
							name: 'ok',
							text: __( 'Got It', 'elementor' ),
							callback: () => introduction.setViewed(),
						} );

						dialog.getElements( 'ok' ).addClass( 'elementor-button elementor-button-success' );
					},
				} );
			}

			return introduction;
		};
	}

	show( event ) {
		this.getIntroduction().show( event.currentTarget );
	}
}
