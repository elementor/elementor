export default class TopBar extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-top-bar';
	}

	className() {
		return 'e-responsive-top-bar';
	}

	events() {
		return {
			click: 'onClick',
		};
	}

	templateHelpers() {
		return {
			title: this.getOption( 'title' ),
			width: '',
			height: '',
			activeDevice: '',
		};
	}

	onClick() {
		const clickCallback = this.getOption( 'click' );

		if ( clickCallback ) {
			clickCallback();
		}
	}
}
