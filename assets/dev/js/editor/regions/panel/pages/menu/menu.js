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
			// Todo: internal command.
			{
				name: 'view-page',
				icon: 'eicon-preview-thin',
				title: __( 'View Page', 'elementor' ),
				type: 'link',
				link: elementor.config.document.urls.permalink,
			},
		],
	} );

	if ( elementor.config.user.is_administrator ) {
		PanelMenu.addAdminMenu();
	}

	PanelMenu.addExitItem();
};

PanelMenu.addAdminMenu = () => {
	PanelMenu.groups.add( {
		name: 'style',
		title: __( 'Settings', 'elementor' ),
		items: [
			{
				name: 'editor-preferences',
				icon: 'eicon-user-preferences',
				title: __( 'User Preferences', 'elementor' ),
				type: 'page',
				callback: () => $e.route( 'panel/editor-preferences' ),
			},
		],
	}, { at: 0 } );

	PanelMenu.addItem( {
		name: 'finder',
		icon: 'eicon-search',
		title: __( 'Finder', 'elementor' ),
		callback: () => $e.route( 'finder' ),
	}, 'navigate_from_page', 'view-page' );
};

PanelMenu.addExitItem = () => {
	const preferredExitUrl = PanelMenu.getExitUrl(),
		preferredExitTitle = PanelMenu.getExitTitle();

	let itemArgs;

	if( ! elementor.config.user.introduction.exit_to && elementor.config.user.is_administrator ) {
		itemArgs = {
			callback: () => PanelMenu.exitDialog(),
		};
	} else {
		itemArgs = {
			type: 'link',
			link: preferredExitUrl,
		};
	}

	PanelMenu.addItem( {
		name: 'exit-to-dashboard',
		icon: 'eicon-exit',
		title: preferredExitTitle,
		...itemArgs,
	} , 'navigate_from_page' );
}

PanelMenu.exitDialog = () => {
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
			strings: {
				confirm: __( 'Apply', 'elementor' ),
				cancel: __( 'Decide Later', 'elementor' ),
			},
		},
	} );

	//Edit template

	const messageContainer = introduction.getDialog().getElements().message[ 0 ],
		select = messageContainer.querySelector( '#exit-to-preferences' ),
		link = messageContainer.querySelector( '#user-preferences' );

	for ( const [ key, value ] of Object.entries( options ) ) {
		const option = document.createElement( 'option' );
		option.innerText = value;
		option.value = key;
		select.appendChild( option );
	}

	link.addEventListener( 'click', ( e ) => {
		e.preventDefault();

		introduction.setViewed();
		introduction.getDialog().hide();
		$e.route( 'panel/editor-preferences' );
	});

	introduction.getDialog().onConfirm = async () => {
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

		await $e.run( 'document/save/draft' );

		window.location.href = PanelMenu.getExitUrl();
	};

	introduction.getDialog().onCancel = () => {
		introduction.setViewed();

		window.location.href = PanelMenu.getExitUrl();
	};

	introduction.show();
}

PanelMenu.getExitUrl = () => {
	const exitPreference = elementor.getPreferences( 'exit_to' );

	switch ( exitPreference ) {
		case 'dashboard':
			return elementor.config.document.urls.main_dashboard;

		default:
			return elementor.config.document.urls.exit_to_dashboard;
	}
}

PanelMenu.getExitTitle = () => {
	const exitPreference = elementor.getPreferences( 'exit_to' );

	switch ( exitPreference ) {
		case 'dashboard':
			return __( 'Exit to WP Dashboard', 'elementor' );

		default:
			let postTypeTitle = elementor.config.document.post_type_title;

			if( 'Revision' === postTypeTitle ) {
				postTypeTitle = 'Page';
			}
			return __( 'Exit to WP %s', 'elementor' ).replace( '%s', postTypeTitle );
	}
}

PanelMenu.getGroups = () => {
	if ( ! PanelMenu.groups ) {
		PanelMenu.initGroups();
	}

	return PanelMenu.groups;
};

PanelMenu.addItem = ( itemData, groupName, before ) => {
	MenuPageView.addItem( PanelMenu.getGroups(), itemData, groupName, before );
};
