import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	__construct( args ) {
		super.__construct( args );

		// Remember last used tab.
		this.activeTabs = {};
	}

	getNamespace() {
		return 'panel/editor';
	}

	defaultTabs() {
		return {
			content: { title: elementor.translate( 'content' ) },
			style: { title: elementor.translate( 'style' ) },
			advanced: { title: elementor.translate( 'advanced' ) },
			layout: { title: elementor.translate( 'layout' ) },
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}

	renderTab( tab ) {
		this.manager.getCurrentPageView().activateTab( tab );
	}

	activateTab( tab ) {
		this.activeTabs[ this.manager.getCurrentPageView().model.id ] = tab;

		super.activateTab( tab );
	}

	setDefaultTab( args ) {
		const editSettings = args.model.get( 'editSettings' );

		let defaultTab;

		if ( this.activeTabs[ args.model.id ] ) {
			defaultTab = this.activeTabs[ args.model.id ];
		} else if ( editSettings && editSettings.get( 'editTab' ) ) {
			defaultTab = editSettings.get( 'editTab' );
		} else {
			defaultTab = jQuery( this.getTabsWrapperSelector() ).find( '.elementor-component-tab' ).eq( 0 ).data( 'tab' );
		}

		// For unit test.
		if ( ! defaultTab ) {
			defaultTab = 'content';
		}

		this.setDefaultRoute( defaultTab );
	}

	openEditor( model, view ) {
		const title = elementor.translate( 'edit_element', [ elementor.getElementData( model ).title ] ),
			editor = elementor.getPanelView().setPage( 'editor', title, {
				model: model,
				controls: elementor.getElementControls( model ),
				editedElementView: view,
			} );

		return editor;
	}
}
