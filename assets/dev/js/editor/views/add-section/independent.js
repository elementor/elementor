import BaseAddSectionView from './base';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export default class AddSectionView extends BaseAddSectionView {
	get id() {
		return 'elementor-add-new-section';
	}

	isStarterActive() {
		return !! elementor.config.starter;
	}

	onRender() {
		super.onRender();

		if ( this.isStarterActive() ) {
			this.initStarter();
		}
	}

	initStarter() {
		const starterEl = document.getElementById( 'elementor-start-building' );

		if ( ! starterEl ) {
			return;
		}

		const previewEl = document.getElementById( 'elementor-preview' );

		if ( previewEl ) {
			previewEl.appendChild( starterEl );
		}

		starterEl.style.display = 'flex';

		this.starterEl = starterEl;

		starterEl.querySelector( '.elementor-start-building__close' )
			?.addEventListener( 'click', () => this.dismissStarter() );

		starterEl.querySelector( '.elementor-start-building__card--ai' )
			?.addEventListener( 'click', () => this.onAiPlannerClick() );

		starterEl.querySelector( '.elementor-start-building__card--templates' )
			?.addEventListener( 'click', () => this.onTemplatesClick() );

		elementor.channels.panelElements.on( 'element:drag:start', this.onPanelDragStart, this );
	}

	onPanelDragStart() {
		this.dismissStarter();
	}

	onCloseButtonClick() {
		EditorOneEventManager.sendCanvasEmptyBoxAction( {
			targetName: 'close',
			containerCreated: false,
		} );
		this.closeSelectPresets();
	}

	onAiPlannerClick() {
		const url = elementor.config.starter?.aiPlannerUrl;

		if ( url ) {
			window.open( url, '_blank', 'noopener,noreferrer' );
		}
	}

	onTemplatesClick() {
		$e.run( 'library/open', this.getTemplatesModalOptions() );
	}

	dismissStarter() {
		if ( ! this.starterEl ) {
			return;
		}

		this.starterEl.style.display = 'none';
		this.starterEl = null;

		elementor.channels.panelElements.off( 'element:drag:start', this.onPanelDragStart, this );

		const config = elementor.config.starter;

		if ( ! config ) {
			return;
		}

		delete elementor.config.starter;

		wp.apiFetch( {
			path: config.restPath,
			method: 'POST',
			data: { starter_dismissed: true },
		} );
	}

	onDestroy() {
		elementor.channels.panelElements.off( 'element:drag:start', this.onPanelDragStart, this );
	}
}
