export class NotesAddPanelMenuItem extends $e.modules.hookUI.After {
	getCommand() {
		return 'panel/state-ready';
	}

	getId() {
		return 'notes-add-panel-menu-item';
	}

	apply() {
		elementor.modules.layouts.panel.pages.menu.Menu.addItem( {
			name: 'notes',
			icon: 'eicon-commenting-o',
			title: __( 'Notes', 'elementor' ) + '<i class="elementor-panel-menu-item-title-badge eicon-pro-icon"></i>',
			callback() {
				elementor.promotion.showDialog( {
					headerMessage: __( 'Notes', 'elementor' ),
					message: __( 'With Notes, teamwork gets even better. Stay in sync with comments, feedback & more on your website.', 'elementor' ),
					top: '-3',
					inlineStart: '+10',
					element: this.$el,
					actionURL: 'https://go.elementor.com/go-pro-notes/',
				} );
			},
		}, 'navigate_from_page', 'finder' );
	}
}

export default NotesAddPanelMenuItem;
