export default class extends elementorModules.common.Component {
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
		return {
			open: ( args ) => {
				this.openEditor( args.model, args.view );

				this.setDefaultTab( args );

				$e.route( this.getDefaultRoute(), args );

				// BC: Run hooks after the route render's the view.
				const action = 'panel/open_editor/' + args.model.get( 'elType' );

				// Example: panel/open_editor/widget
				elementor.hooks.doAction( action, this.manager, args.model, args.view );

				// Example: panel/open_editor/widget/heading
				elementor.hooks.doAction( action + '/' + args.model.get( 'widgetType' ), this.manager, args.model, args.view );
			},
		};
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
		let defaultTab;
		if ( this.activeTabs[ args.model.id ] ) {
			defaultTab = this.activeTabs[ args.model.id ];
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
