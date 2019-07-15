const TemplateLibraryLayoutView = require( 'elementor-templates/views/library-layout' );

export default class extends elementorModules.ComponentModal {
	__construct( args ) {
		super.__construct( args );

		this.docLibraryConfig = elementor.config.document.remoteLibrary;

		if ( 'block' === this.docLibraryConfig.type ) {
			this.setDefault( 'templates/blocks' );
		} else {
			this.setDefault( 'templates/pages' );
		}
	}

	getNamespace() {
		return 'library';
	}

	getModalLayout() {
		return TemplateLibraryLayoutView;
	}

	getTabs() {
		// Allow add tabs via `addTab`.
		if ( _.isEmpty( this.tabs ) ) {
			this.tabs = {
				'templates/blocks': {
					title: elementor.translate( 'blocks' ),
					filter: {
						source: 'remote',
						type: 'block',
						subtype: this.docLibraryConfig.category,
					},
				},
				'templates/pages': {
					title: elementor.translate( 'pages' ),
					filter: {
						source: 'remote',
						type: 'page',
					},
				},
				'templates/my-templates': {
					title: elementor.translate( 'my_templates' ),
					filter: {
						source: 'local',
					},
				},
			};
		}

		return this.tabs;
	}

	getRoutes() {
		return {
			import: () => {
				this.manager.layout.showImportView();
			},

			'save-template': ( args ) => {
				this.manager.layout.showSaveTemplateView( args.model );
			},
		};
	}

	getCommands() {
		return {
			show: this.show,
		};
	}

	getShortcuts() {
		return {
			show: {
				keys: 'ctrl+shift+l',
			},
		};
	}

	getTabsWrapperSelector() {
		return '#elementor-template-library-header-menu';
	}

	renderTab( tab ) {
		this.manager.setScreen( this.tabs[ tab ].filter );
	}

	activateTab( tab ) {
		elementorCommon.route.saveState( 'library' );

		super.activateTab( tab );
	}

	open() {
		super.open();

		if ( ! this.manager.layout ) {
			this.manager.layout = this.layout;
		}

		return true;
	}

	close() {
		if ( ! super.close() ) {
			return false;
		}

		this.manager.modalConfig = {};

		return true;
	}

	show( args ) {
		this.manager.modalConfig = args;

		if ( args.toDefault || ! elementorCommon.route.restoreState( 'library' ) ) {
			elementorCommon.route.to( this.getDefault() );
		}
	}
}
