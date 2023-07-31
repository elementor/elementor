import LayoutApp from './layout-app';
import { onConnect } from './helpers';
import { takeScreenshots } from './utils/screenshot';
import {
	createPreviewContainer,
	deletePreviewContainer,
	setPreviewContainerContents,
	setPreviewContainerEmpty,
} from './utils/preview-container';

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

		createPreviewContainer( {
			// Create the container at the "drag widget here" area position.
			at: this.view.getOption( 'at' ),
		} );

		setPreviewContainerEmpty();

		const rootElement = document.createElement( 'div' );
		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;

		document.body.append( rootElement );

		ReactDOM.render(
			<LayoutApp
				isRTL={ isRTL }
				colorScheme={ colorScheme }
				onClose={ () => {
					deletePreviewContainer();

					ReactDOM.unmountComponentAtNode( rootElement );
					rootElement.remove();

					this.openPanel();
				} }
				onConnect={ onConnect }
				onGenerated={ this.onGenerated }
				onSelect={ this.onSelect }
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

	async onGenerated( templates ) {
		const screenshots = await takeScreenshots( templates );

		return screenshots.map( ( src, index ) => ( {
			screenshot: src,
			template: templates[ index ],
		} ) );
	}

	onSelect( template ) {
		setPreviewContainerContents( template );
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
