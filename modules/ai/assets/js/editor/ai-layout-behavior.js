import LayoutApp from './layout-app';
import { onConnect } from './helpers';
import { takeScreenshots } from './utils/screenshot';
import { startHistoryLog } from './utils/history';
import { generateIds } from './utils/genereate-ids';
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
		setPreviewContainerContents( template );
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

		$button.html( '<i class="eicon-ai"></i>' );

		this.ui.addTemplateButton.after( $button );
	}
}
