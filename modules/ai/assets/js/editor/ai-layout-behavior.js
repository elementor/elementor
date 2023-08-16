import LayoutApp from './layout-app';
import { onConnect } from './helpers';
import { takeScreenshots } from './utils/screenshot';
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

		this.previewContainer.setIdle();

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
				onGenerationStart={ () => {} }
				onGenerationEnd={ this.onGenerated }
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

	async onGenerated( templates ) {
		const screenshots = await takeScreenshots( templates );

		return screenshots.map( ( src, index ) => ( {
			screenshot: src,
			template: templates[ index ],
		} ) );
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
		const $button = jQuery( '<button>', {
			class: 'e-ai-layout-button elementor-add-section-area-button e-button-primary',
			title: __( 'AI Builder', 'elementor' ),
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
