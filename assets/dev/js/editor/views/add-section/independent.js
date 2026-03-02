import BaseAddSectionView from './base';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export default class AddSectionView extends BaseAddSectionView {
	get id() {
		return 'elementor-add-new-section';
	}

	ui() {
		return {
			...BaseAddSectionView.prototype.ui.call( this ),
			startBuilding: '.elementor-start-building',
			starterClose: '.elementor-start-building__close',
			aiPlannerCard: '.elementor-start-building__card--ai',
			templatesCard: '.elementor-start-building__card--templates',
		};
	}

	events() {
		return {
			...BaseAddSectionView.prototype.events.call( this ),
			'click @ui.starterClose': 'onStarterCloseClick',
			'click @ui.aiPlannerCard': 'onAiPlannerClick',
			'click @ui.templatesCard': 'onTemplatesClick',
		};
	}

	isStarterActive() {
		return !! elementor.config.starter;
	}

	onRender() {
		super.onRender();

		if ( this.isStarterActive() ) {
			elementor.channels.panelElements.on( 'element:drag:start', this.onPanelDragStart, this );
		}
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

	onStarterCloseClick() {
		this.dismissStarter();
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
		if ( ! this.ui.startBuilding?.length ) {
			return;
		}

		const starterEl = this.ui.startBuilding[ 0 ];

		starterEl.addEventListener( 'transitionend', () => {
			this.ui.startBuilding.hide();
		}, { once: true } );

		starterEl.classList.add( 'elementor-start-building--dismissed' );

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
