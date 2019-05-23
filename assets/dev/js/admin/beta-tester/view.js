export default class BetaTesterView extends Marionette.ItemView {
	constructor() {
		super();
		this.id = 'elementor-beta-tester-dialog-content';
		this.template = '#tmpl-elementor-beta-tester';
	}

	ui() {
		return {
			betaForm: '#elementor-beta-tester-dialog-form',
			betaEmail: '#elementor-beta-tester-email',
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
		elementorCommon.ajax.addRequest( 'beta_tester_newsletter', {
			data: {
				betaTesterEmail: email,
			},
			success: () => elementorBetaTester.layout.hideModal(),
		} );
	}

	onRender() {}
}
