import MenuPageView from 'elementor-panel/pages/menu/base';

export default class PanelMenu extends MenuPageView {
	initialize() {
		this.collection = PanelMenu.getGroups();
	}

	getArrowClass() {
		return 'eicon-chevron-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );
	}

	onRender() {
		elementor.getPanelView().getHeaderView().ui.menuIcon.removeClass( 'eicon-menu-bar' ).addClass( this.getArrowClass() );
	}

	onDestroy() {
		elementor.getPanelView().getHeaderView().ui.menuIcon.removeClass( this.getArrowClass() ).addClass( 'eicon-menu-bar' );
	}
}

PanelMenu.groups = null;

PanelMenu.initGroups = () => {
	PanelMenu.groups = new Backbone.Collection( [] );

	// Keep the old `more` for BC, since 3.0.0.
	PanelMenu.groups.add( {
		name: 'more',
		title: __( 'More', 'elementor' ),
		items: [],
	} );

	PanelMenu.groups.add( {
		name: 'navigate_from_page',
		title: __( 'Navigate From Page', 'elementor' ),
		items: [

		],
	} );

	if ( elementor.config.user.is_administrator ) {
		PanelMenu.addAdminMenu();
	}
};

PanelMenu.addAdminMenu = () => {
	// PanelMenu.groups.add( {
	// 	name: 'style',
	// 	title: __( 'Settings', 'elementor' ),
	// 	items: [
	// 		{
	// 			name: 'editor-preferences',
	// 			icon: 'eicon-user-preferences',
	// 			title: __( 'User Preferences', 'elementor' ),
	// 			type: 'page',
	// 			callback: () => $e.route( 'panel/editor-preferences' ),
	// 		},
	// 	],
	// }, { at: 0 } );

	PanelMenu.addItem( {
		name: 'user_preferences',
		svg: `
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M5.6 8.5C4.484 8.5 3.554 9.268 3.284 10.3H2V11.5H3.284C3.554 12.532 4.484 13.3 5.6 13.3C6.716 13.3 7.646 12.532 7.916 11.5H14V10.3H7.916C7.646 9.268 6.716 8.5 5.6 8.5ZM5.6 12.1C4.94 12.1 4.4 11.56 4.4 10.9C4.4 10.24 4.94 9.7 5.6 9.7C6.26 9.7 6.8 10.24 6.8 10.9C6.8 11.56 6.26 12.1 5.6 12.1ZM12.716 4.3C12.446 3.268 11.516 2.5 10.4 2.5C9.284 2.5 8.354 3.268 8.084 4.3H2V5.5H8.084C8.354 6.532 9.284 7.3 10.4 7.3C11.516 7.3 12.446 6.532 12.716 5.5H14V4.3H12.716ZM10.4 6.1C9.74 6.1 9.2 5.56 9.2 4.9C9.2 4.24 9.74 3.7 10.4 3.7C11.06 3.7 11.6 4.24 11.6 4.9C11.6 5.56 11.06 6.1 10.4 6.1Z" fill="#6D7882"/>
			</svg>
		`,
		title: __( 'User Preferences', 'elementor' ),
		callback: function() {
			$e.run( 'panel/open' );
			$e.route( 'panel/editor-preferences' );
		},
	}, 'navigate_from_page' );

	PanelMenu.addItem( {
		name: 'notes',
		icon: 'eicon-commenting-o',
		title: __( 'Notes', 'elementor' ),
		callback: function() {
			elementor.promotion.showDialog( {
				headerMessage: __( 'Notes', 'elementor' ),
				message: __( 'With Notes, teamwork gets even better. Stay in sync with comments, feedback & more on your website.', 'elementor' ),
				top: '-3',
				inlineStart: '+10',
				element: this.$el,
				actionURL: 'https://go.elementor.com/go-pro-notes/',
			} );
		},
	}, 'navigate_from_page' );

	PanelMenu.addItem( {
		name: 'keyboard_shortcuts',
		svg:
			`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M5 12.2H6.2V13.4H5V12.2ZM7.4 12.2H8.6V13.4H7.4V12.2ZM9.8 12.2H11V13.4H9.8V12.2ZM3.2 2C2.88174 2 2.57652 2.12643 2.35147 2.35147C2.12643 2.57652 2 2.88174 2 3.2V9.2C2 9.51826 2.12643 9.82348 2.35147 10.0485C2.57652 10.2736 2.88174 10.4 3.2 10.4H12.8C13.1183 10.4 13.4235 10.2736 13.6485 10.0485C13.8736 9.82348 14 9.51826 14 9.2V3.2C14 2.88174 13.8736 2.57652 13.6485 2.35147C13.4235 2.12643 13.1183 2 12.8 2H3.2ZM3.2 3.2H12.8V9.2H3.2V3.2ZM3.8 3.8V5H5V3.8H3.8ZM5.6 3.8V5H6.8V3.8H5.6ZM7.4 3.8V5H8.6V3.8H7.4ZM9.2 3.8V5H10.4V3.8H9.2ZM11 3.8V5H12.2V3.8H11ZM3.8 5.6V6.8H5V5.6H3.8ZM5.6 5.6V6.8H6.8V5.6H5.6ZM7.4 5.6V6.8H8.6V5.6H7.4ZM9.2 5.6V6.8H10.4V5.6H9.2ZM11 5.6V6.8H12.2V5.6H11ZM5.6 7.4V8.6H10.4V7.4H5.6Z" fill="#6D7882"/>
			</svg>
		`,
		title: __( 'Keyboard Shortcuts', 'elementor' ),
		callback: function() {
			$e.route( 'shortcuts' );
		},
	}, 'navigate_from_page' );

	// PanelMenu.addItem( {
	// 	name: 'finder',
	// 	icon: 'eicon-search',
	// 	title: __( 'Finder', 'elementor' ),
	// 	callback: () => $e.route( 'finder' ),
	// }, 'navigate_from_page', 'view-page' );
};

PanelMenu.addExitItem = () => {
	let itemArgs;

	if ( ! elementor.config.user.introduction.exit_to && elementor.config.user.is_administrator ) {
		const exitIntroduction = PanelMenu.createExitIntroductionDialog();

		itemArgs = {
			callback: () => exitIntroduction.show(),
		};
	} else {
		itemArgs = {
			type: 'link',
			link: PanelMenu.getExitUrl(),
		};
	}

	PanelMenu.addItem( {
		name: 'exit',
		icon: 'eicon-exit',
		title: __( 'Exit', 'elementor' ),
		...itemArgs,
	}, 'navigate_from_page' );
};

PanelMenu.createExitIntroductionDialog = () => {
	const template = document.querySelector( '#tmpl-elementor-exit-dialog' );
	const { options } = elementor.settings.editorPreferences.getEditedView().getContainer().controls.exit_to;

	const introduction = new elementorModules.editor.utils.Introduction( {
		introductionKey: 'exit_to',
		dialogType: 'confirm',
		dialogOptions: {
			id: 'elementor-change-exit-preference-dialog',
			className: 'dialog-exit-preferences',
			headerMessage: __( 'New options for "Exit to..."', 'elementor' ),
			message: template.innerHTML,
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: __( 'Apply', 'elementor' ),
				cancel: __( 'Decide Later', 'elementor' ),
			},
			effects: {
				show: 'fadeIn',
				hide: 'fadeOut',
			},
			onConfirm: () => {
				introduction.setViewed();

				$e.run( 'document/elements/settings', {
					container: elementor.settings.editorPreferences.getEditedView().getContainer(),
					settings: {
						exit_to: select.value,
					},
					options: {
						external: true,
					},
				} );

				elementor.settings.editorPreferences.save( () => {
					window.location.href = PanelMenu.getExitUrl();
				} );
			},
			onCancel: () => {
				introduction.setViewed();

				window.location.href = PanelMenu.getExitUrl();
			},
		},
	} );

	//Edit the template inside the dialog
	const messageContainer = introduction.getDialog().getElements().message[ 0 ],
		select = messageContainer.querySelector( '#exit-to-preferences' ),
		link = messageContainer.querySelector( '#user-preferences' );

	for ( const [ key, value ] of Object.entries( options ) ) {
		const option = document.createElement( 'option' );
		option.innerText = value;
		option.value = key;
		select.appendChild( option );
	}

	// Bind click event to the link in the dialog to open the editor preferences.
	link.addEventListener( 'click', ( e ) => {
		e.preventDefault();

		introduction.setViewed();
		elementor.config.user.introduction.exit_to = true;
		introduction.getDialog().hide();
		$e.route( 'panel/editor-preferences' );

		// Force the exit button to rerender by creating new exit button.
		PanelMenu.addExitItem();
	} );

	return introduction;
};

/**
 * Get the exit url according to the 'exit_to' user preference.
 */
PanelMenu.getExitUrl = () => {
	const exitPreference = elementor.getPreferences( 'exit_to' );

	switch ( exitPreference ) {
		case 'dashboard':
			return elementor.config.document.urls.main_dashboard;

		case 'all_posts':
			return elementor.config.document.urls.all_post_type;

		case 'this_post':
		default:
			return elementor.config.document.urls.exit_to_dashboard;
	}
};

PanelMenu.getGroups = () => {
	if ( ! PanelMenu.groups ) {
		PanelMenu.initGroups();
	}

	return PanelMenu.groups;
};

PanelMenu.addItem = ( itemData, groupName, before ) => {
	MenuPageView.addItem( PanelMenu.getGroups(), itemData, groupName, before );
};
