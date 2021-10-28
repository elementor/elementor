export default class View extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-bar';
	}

	id() {
		return 'e-responsive-bar';
	}

	ui() {
		const prefix = '#' + this.id();

		return {
			buttonPreview: '#elementor-panel-footer-saver-preview',
			// buttonPublish: '#elementor-panel-saver-button-publish',
		};
	}

	events() {
		return {
			'click @ui.buttonPreview': 'onClickButtonPreview',
			// 'click @ui.buttonPublish': 'onClickButtonPublish',
		};
	}

	behaviors() {
		var behaviors = {
			saver: {
				behaviorClass: elementor.modules.components.saver.behaviors.FooterSaver,
			},
		};

		return elementor.hooks.applyFilters( 'panel/footer/behaviors', behaviors, this );
	}

	onClickButtonPreview() {
		$e.run( 'editor/documents/preview', { id: elementor.documents.getCurrent().id } );
	}

	// onClickButtonPublish() {
	// 	if ( this.ui.buttonPublish.hasClass( 'elementor-disabled' ) ) {
	// 		return;
	// 	}

	// 	$e.run( 'document/save/default' );
	// }
}
