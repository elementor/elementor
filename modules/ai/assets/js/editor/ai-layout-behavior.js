import LayoutApp from './layout-app';
import { onConnect } from './helpers';
import { takeScreenshot } from './utils/screenshot';
import { startHistoryLog } from './utils/history';
import { generateIds } from './utils/genereate-ids';
import { createPreviewContainer } from './utils/preview-container';

export default class AiLayoutBehavior extends Marionette.Behavior {
	previewContainer = null;

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

		this.previewContainer = createPreviewContainer( {
			// Create the container at the "drag widget here" area position.
			at: this.view.getOption( 'at' ),
		} );

		this.previewContainer.init();

		const rootElement = document.createElement( 'div' );
		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
		const isRTL = elementorCommon.config.isRTL;

		document.body.append( rootElement );

		ReactDOM.render(
			<LayoutApp
				isRTL={ isRTL }
				colorScheme={ colorScheme }
				onClose={ () => {
					this.previewContainer.destroy();
					this.previewContainer = null;

					ReactDOM.unmountComponentAtNode( rootElement );
					rootElement.remove();

					this.openPanel();
				} }
				onConnect={ onConnect }
				onGenerate={ this.onGenerate.bind( this ) }
				onData={ this.onData }
				onSelect={ this.onSelect.bind( this ) }
				onInsert={ this.onInsert.bind( this ) }
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

	hideDropArea() {
		this.view.onCloseButtonClick();
	}

	onGenerate() {
		this.previewContainer?.reset();
	}

	async onData( template ) {
		const screenshot = await takeScreenshot( template );

		return {
			screenshot,
			template,
		};
	}

	onSelect( template ) {
		this.previewContainer.setContent( template );
	}

	onInsert( template ) {
		this.hideDropArea();

		const endHistoryLog = startHistoryLog( {
			type: 'import',
			title: __( 'AI Layout', 'elementor' ),
		} );

		$e.run( 'document/elements/create', {
			container: elementor.getPreviewContainer(),
			model: generateIds( template ),
			options: {
				at: this.view.getOption( 'at' ),
				edit: true,
			},
		} );

		endHistoryLog();
	}

	onRender() {
		const $button = jQuery( '<div>', {
			class: 'e-ai-layout-button elementor-add-section-area-button e-button-primary',
			title: __( 'Build with AI', 'elementor' ),
			role: 'button',
		} );

		$button.html( `
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<i class="eicon-ai"></i>
		` );

		this.ui.addTemplateButton.after( $button );
	}
}
