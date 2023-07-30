import LayoutApp from './layout-app';

export default class AiLayoutBehavior extends Marionette.Behavior {
	ui() {
		return {
			aiButton: '.e-ai-layout-button',
			addTemplateButton: '.elementor-add-template-button',
		};
	}

	events() {
		return {
			'click @ui.aiButton': 'onAiButtonClick',
		};
	}

	onAiButtonClick( e ) {
		e.stopPropagation();

		this.closePanel();

		const emptySection = this.createEmptySection();
		const rootElement = document.createElement( 'div' );

		document.body.append( rootElement );

		ReactDOM.render(
			<LayoutApp
				onClose={ () => {
					const isEmptySection = elementor.getContainer( emptySection.id ) === emptySection;

					if ( isEmptySection ) {
						$e.run( 'document/elements/delete', {
							container: emptySection,
						} );
					}

					ReactDOM.unmountComponentAtNode( rootElement );
					rootElement.remove();

					this.openPanel();
				} }
			/>,
			rootElement,
		);
	}

	closePanel() {
		$e.run( 'panel/close' );
		$e.components.get( 'panel' ).blockUserInteractions();
	}

	openPanel() {
		$e.run( 'panel/open' );
		$e.components.get( 'panel' ).unblockUserInteractions();
	}

	createEmptySection() {
		// Creating an empty section and not a container in order to support sites without containers.
		// This section is used for UI purposes only.
		const emptySection = $e.run( 'document/elements/create', {
			container: elementor.getPreviewContainer(),
			model: {
				elType: 'section',
			},
			options: {
				edit: false,
				at: this.view.getOption( 'at' ),
			},
		} );

		emptySection.view.$el.addClass( 'e-ai-empty-container' );

		return emptySection;
	}

	onRender() {
		const $button = jQuery( '<button>', {
			class: 'e-ai-layout-button elementor-add-section-area-button e-button-primary',
			title: __( 'AI Builder', 'elementor' ),
		} );

		$button.html( '<i class="eicon-ai"></i>' );

		this.ui.addTemplateButton.after( $button );
	}
}
