import BaseAddSectionView from './base';

export default class AddSectionView extends BaseAddSectionView {
	get id() {
		return 'elementor-add-new-section';
	}

	ui() {
		return {
			...BaseAddSectionView.prototype.ui.call( this ),
			startBuilding: '.elementor-start-building',
			aiPlannerCard: '.elementor-start-building__card--ai',
			templatesCard: '.elementor-start-building__card--templates',
		};
	}

	events() {
		return {
			...BaseAddSectionView.prototype.events.call( this ),
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
			this.listenToOnce( elementor.elements, 'add', this.dismissStarter );
		}
	}

	onCloseButtonClick() {
		this.closeSelectPresets();
	}

	onAiPlannerClick() {
		const config = elementor.config.starter;

		this.dismissStarter();

		if ( config?.aiPlannerAction ) {
			const args = config.aiPlannerActionArgs ? JSON.parse( config.aiPlannerActionArgs ) : {};
			$e.run( config.aiPlannerAction, args );
		} else if ( config?.aiPlannerUrl && config.aiPlannerUrl !== '#' ) {
			window.open( config.aiPlannerUrl, '_blank', 'noopener,noreferrer' );
		}
	}

	onTemplatesClick() {
		this.dismissStarter();
		$e.run( 'library/open', this.getTemplatesModalOptions() );
	}

	dismissStarter() {
		if ( ! this.ui.startBuilding?.length ) {
			return;
		}

		this.ui.startBuilding.hide();

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
}
