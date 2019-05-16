export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Editor';
		this.namespace = 'panel/editor';

		// Remember last used tab.
		this.activeTabs = {};
	}

	activateTab( tab ) {
		const editor = this.parent.getCurrentPageView().activateTab( tab );

		this.activeTabs[ editor.model.id ] = tab;

		super.activateTab( tab );
	}

	getTabsWrapperSelector() {
		return '.elementor-panel-navigation';
	}

	getTabs() {
		return {
			content: elementor.translate( 'content' ),
			style: elementor.translate( 'style' ),
			advanced: elementor.translate( 'advanced' ),
			layout: elementor.translate( 'layout' ),
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
		elementor.hooks.doAction( action, this, model, view );

		// Example: panel/open_editor/widget/heading
		elementor.hooks.doAction( action + '/' + model.get( 'widgetType' ), this, model, view );

		return editor;
	}
}
