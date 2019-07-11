export default class BetaTesterView extends Marionette.ItemView {
	constructor() {
		super();
		this.id = 'elementor-beta-tester-dialog-content';
		this.template = '#tmpl-elementor-beta-tester';
	}

	ui() {
		return {
			betaForm: '#elementor-beta-tester-form',
			betaEmail: '#elementor-beta-tester-form__email',
			betaButton: '#elementor-beta-tester-form__submit',
		};
	}

	events() {
		return {
			'submit @ui.betaForm': 'onBetaFormSubmit',
		};
	}

	onBetaFormSubmit( event ) {
		event.preventDefault();

		const email = this.ui.betaEmail.val();

		this.ui.betaButton.addClass( 'elementor-button-state' );

		elementorCommon.ajax.addRequest( 'beta_tester_signup', {
			data: {
				betaTesterEmail: email,
			},
			// Do not wait for response.
		} );
		elementorBetaTester.layout.hideModal();
	}

	onRender() {}
}
