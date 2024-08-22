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
				const hasProAndNotConnected = elementor.helpers.hasProAndNotConnected();

				elementor.promotion.showDialog( {
					title: __( 'Notes', 'elementor' ),
					content: __( 'With Notes, teamwork gets even better. Stay in sync with comments, feedback & more on your website.', 'elementor' ),
					position: {
						blockStart: '-3',
						inlineStart: '+10',
					},
					targetElement: this.$el,
					actionButton: {
						url: hasProAndNotConnected
							? elementorProEditorConfig.urls.connect
							: elementor.config.promotions.notes.upgrade_url || 'https://go.elementor.com/go-pro-notes/',
						text: hasProAndNotConnected
							? __( 'Connect & Activate', 'elementor' )
							: __( 'Upgrade', 'elementor' ),
					},
				} );
			},
		}, 'navigate_from_page', 'finder' );
	}
}

export default NotesAddPanelMenuItem;
