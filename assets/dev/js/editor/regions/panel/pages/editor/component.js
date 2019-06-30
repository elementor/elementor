export default class extends elementorModules.Component {
	__construct( args ) {
		super.__construct( args );

		// Remember last used tab.
		this.activeTabs = {};
	}

	getNamespace() {
		return 'panel/editor';
	}

	getTabs() {
		return {
			content: { title: elementor.translate( 'content' ) },
			style: { title: elementor.translate( 'style' ) },
			advanced: { title: elementor.translate( 'advanced' ) },
			layout: { title: elementor.translate( 'layout' ) },
		};
	}

	getCommands() {
		return {
			open: ( args ) => {
				this.openEditor( args.model, args.view );

				this.setDefaultTab( args );

				elementorCommon.route.to( this.getDefault(), args );
			},
		};
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}

	renderTab( tab ) {
		this.context.getCurrentPageView().activateTab( tab );
	}

	activateTab( tab ) {
		this.activeTabs[ this.context.getCurrentPageView().model.id ] = tab;

		super.activateTab( tab );
	}

	setDefaultTab( args ) {
		let defaultTab;
		if ( this.activeTabs[ args.model.id ] ) {
			defaultTab = this.activeTabs[ args.model.id ];
		} else if ( args.model.get( 'elType' ).match( /section|column/ ) ) {
			defaultTab = 'layout';
		} else {
			defaultTab = 'content';
		}

		this.setDefault( defaultTab );
	}

	openEditor( model, view ) {
		const title = elementor.translate( 'edit_element', [ elementor.getElementData( model ).title ] ),
		editor = elementor.getPanelView().setPage( 'editor', title, {
			model: model,
			controls: elementor.getElementControls( model ),
			editedElementView: view,
		} );

		const action = 'panel/open_editor/' + model.get( 'elType' );

		// Example: panel/open_editor/widget
		elementor.hooks.doAction( action, this.context, model, view );

		// Example: panel/open_editor/widget/heading
		elementor.hooks.doAction( action + '/' + model.get( 'widgetType' ), this.context, model, view );

		return editor;
	}
}
