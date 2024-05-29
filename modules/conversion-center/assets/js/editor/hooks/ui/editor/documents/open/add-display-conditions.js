export class ConversionsAddEditorUI extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'elementor-conversion-center-add-editor-ui';
	}

	getConditions( args ) {
		return 'contact-buttons' === elementor?.config?.document?.type;
	}

	apply() {
		if ( elementor.panel ) {
			this.addUI();
		} else {
			// First open, the panel is not available yet.
			elementor.once( 'preview:loaded', this.addUI.bind( this ) );
		}
	}

	addUI() {

		this.addPanelFooterSubmenuItems();

	}


	addPanelFooterSubmenuItems() {
		const footerView = elementor.getPanelView().footer.currentView,
			behavior = footerView._behaviors[ Object.keys( footerView.behaviors() ).indexOf( 'saver' ) ];

		footerView.ui.menuConditions = footerView.addSubMenuItem( 'saver-options', {
			before: 'save-template',
			name: 'conditions',
			icon: 'eicon-flow',
			title: __( 'Display Conditions', 'elementor-pro' ),
			callback: () => $e.route( 'theme-builder-publish/conditions' ),
		} );

		behavior.ui.buttonPreview
			.tipsy( 'disable' )
			.html( jQuery( '#tmpl-elementor-theme-builder-button-preview' ).html() )
			.addClass( 'elementor-panel-footer-theme-builder-buttons-wrapper elementor-toggle-state' );
	}
}

export default ConversionsAddEditorUI;
