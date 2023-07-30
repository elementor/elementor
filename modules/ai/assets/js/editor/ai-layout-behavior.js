import LayoutApp from './layout-app';
import { onConnect } from './helpers';
import { toggleHistory } from './utils/history';
import { screenshot } from './utils/screenshot';

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
		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;

		document.body.append( rootElement );

		ReactDOM.render(
			<LayoutApp
				isRTL={ isRTL }
				colorScheme={ colorScheme }
				onClose={ () => {
					this.deleteEmptySection( emptySection );

					ReactDOM.unmountComponentAtNode( rootElement );
					rootElement.remove();

					this.openPanel();
				} }
				onConnect={ onConnect }
				onGenerated={ this.onGenerated }
				onInsert={ () => {} }
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
		toggleHistory( false );

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

		toggleHistory( true );

		return emptySection;
	}

	deleteEmptySection( emptySection ) {
		toggleHistory( false );

		const isEmptySection = elementor.getContainer( emptySection.id ) === emptySection;

		if ( isEmptySection ) {
			$e.run( 'document/elements/delete', {
				container: emptySection,
			} );
		}

		toggleHistory( true );
	}

	async onGenerated( models ) {
		const screenshots = await screenshot( models );

		return screenshots.map( ( src, index ) => ( {
			screenshot: src,
			template: models[ index ],
		} ) );
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
