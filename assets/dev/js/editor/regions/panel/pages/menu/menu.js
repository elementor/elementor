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
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="16" height="16" fill="url(#pattern13)"></rect>
				<defs>
					<pattern id="pattern13" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image13" transform="scale(0.0416667)"></use>
					</pattern>
					<image id="image13" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAdUlEQVRIieWUQQqAMAwEp+L/P6W+q148yQqbVGnAufTSNmQzBP7CAXRgiz5s5r2eeAPA+vBJtKiiASzBT8N8HpHbwX6d4SGXxlI3lOcNay4jmlpFy2iqsCIa6aCuuunNqVDZpdeCwtU0o/A8TV+NSHVQV78pnBhuGEafnjPxAAAAAElFTkSuQmCC"></image>
				</defs>
			</svg>`,
		title: __( 'User Preferences', 'elementor' ),
		callback: function() {
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
			`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<rect width="16" height="16" fill="url(#pattern14)"/>
				<defs>
					<pattern id="pattern14" patternContentUnits="objectBoundingBox" width="1" height="1">
						<use xlink:href="#image14" transform="scale(0.0416667)"/>
					</pattern>
					<image id="image14" width="24" height="24" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAeElEQVRIie2UYQqAIAxGn9Hhku5/AfUe9aMUiRYGn0Hgg+HQsY9NHQwGKlYgAZvIIuBrgShMni3UAnlTRck3CZPeYgnUFb31mwTkdLuD+SEAwDUI1zHueti9RVYFzvAtzJjPnmk6V9UvhmM6FDzacRGARdCAwR/YAYJDZvmoGcvHAAAAAElFTkSuQmCC"/>
				</defs>
			</svg>`,
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
