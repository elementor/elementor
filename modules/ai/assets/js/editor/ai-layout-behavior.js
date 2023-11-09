import { __ } from '@wordpress/i18n';
import {
	importToEditor,
	renderLayoutApp,
} from './utils/editor-integration';

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

		renderLayoutApp( {
			mode: 'layout',
			at: this.view.getOption( 'at' ),
			onInsert: this.onInsert.bind( this ),
			onRenderApp: ( args ) => {
				args.previewContainer.init();
			},
			onGenerate: ( args ) => {
				args.previewContainer.reset();
			},
		} );
	}

	hideDropArea() {
		this.view.onCloseButtonClick();
	}

	onInsert( template ) {
		this.hideDropArea();

		importToEditor( {
			at: this.view.getOption( 'at' ),
			template,
			historyTitle: __( 'AI Layout', 'elementor' ),
		} );
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
