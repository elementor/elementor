import ComponentBase from 'elementor-editor/component-base';
import * as commands from './commands/';
import { SetDirectionMode } from 'elementor-document/hooks';

export default class Component extends ComponentBase {
	__construct( args ) {
		super.__construct( args );

		// Remember last used tab.
		this.activeTabs = {};
		this.activeModelId = null;
	}

	getNamespace() {
		return 'panel/editor';
	}

	defaultTabs() {
		return {
			content: { title: __( 'Content', 'elementor' ) },
			style: { title: __( 'Style', 'elementor' ) },
			advanced: { title: __( 'Advanced', 'elementor' ) },
			layout: { title: __( 'Layout', 'elementor' ) },
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}

	renderTab( tab, args ) {
		const { model, view, activeControl } = args;

		let elementTitle = model?.attributes?.custom?.isPreset || model?.changed?.title
			? model.attributes.title
			: elementor.getElementData( model ).title;

		if ( model.attributes.settings.attributes.presetTitle ) {
			elementTitle = model.attributes.settings.attributes.presetTitle;
		}

		/* Translators: %s: Element name. */
		const title = sprintf( __( 'Edit %s', 'elementor' ), elementTitle );

		if ( this.shouldRenderPage( tab, args.model.id ) ) {
			this.activeModelId = args.model.id;
			this.activeTabs[ args.model.id ] = tab;

			elementor.getPanelView().setPage( 'editor', title, {
				tab,
				model,
				controls: elementor.getElementControls( model ),
				editedElementView: view,
			} );
		}

		this.activateControl( activeControl );
	}

	shouldRenderPage( tab, modelId ) {
		const currentPanelView = elementor.getPanelView();

		const isSamePage = 'editor' === currentPanelView.getCurrentPageName();
		const isSameTab = tab === currentPanelView.getCurrentPageView().activeTab;
		const isEditingSameModel = modelId === this.activeModelId;

		return ! isSamePage || ! isSameTab || ! isEditingSameModel;
	}

	setDefaultTab( args ) {
		let defaultTab;

		const editSettings = args.model.get( 'editSettings' );

		if ( this.activeTabs[ args.model.id ] ) {
			defaultTab = this.activeTabs[ args.model.id ];
		} else if ( editSettings && editSettings.get( 'defaultEditRoute' ) ) {
			defaultTab = editSettings.get( 'defaultEditRoute' );
		}

		if ( defaultTab ) {
			// Ensure tab is exist.
			const controlsTabs = elementor.getElementData( args.model ).tabs_controls;

			// Fallback to first tab.
			if ( ! controlsTabs[ defaultTab ] ) {
				defaultTab = Object.keys( controlsTabs )[ 0 ];
			}

			this.setDefaultRoute( defaultTab );

			return true;
		}

		return false;
	}

	/**
	 * Callback on route open under the current namespace.
	 *
	 * @param {string} route
	 * @param {Object} routeArgs
	 *
	 * @return {void}
	 */
	onRoute( route, routeArgs = {} ) {
		super.onRoute( route );

		const { view } = routeArgs;

		if ( ! view?.getContainer() ) {
			return;
		}

		SetDirectionMode.set( view.getContainer() );
	}

	/**
	 * Callback on route close under the current namespace.
	 *
	 * @param {string } route - Route ID.
	 *
	 * @return {void}
	 */
	onCloseRoute( route ) {
		super.onCloseRoute( route );

		$e.uiStates.remove( 'document/direction-mode' );
	}
}
