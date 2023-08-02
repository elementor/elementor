import LayoutApp from './layout-app';
import { onConnect } from './helpers';
import { takeScreenshots } from './utils/screenshot';
import { startHistoryLog } from './utils/history';
import { generateIds } from './utils/genereate-ids';
import {
	createPreviewContainer,
	deletePreviewContainer,
	setPreviewContainerContent,
	setPreviewContainerIdle,
	setPreviewContainerLoading,
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

		setPreviewContainerIdle();

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
				onGenerationStart={ this.onGenerationStart }
				onGenerationEnd={ this.onGenerationEnd }
				onSelect={ this.onSelect }
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

	onGenerationStart() {
		setPreviewContainerLoading();
	}

	async onGenerationEnd( templates ) {
		const screenshots = await takeScreenshots( templates );

		return screenshots.map( ( src, index ) => ( {
			screenshot: src,
			template: templates[ index ],
		} ) );
	}

	onSelect( template ) {
		setPreviewContainerContent( template );
	}

	onInsert( template ) {
		deletePreviewContainer();
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
