export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Library';
		this.namespace = 'library';

		this.tabs = {
			'templates/block': elementor.translate( 'blocks' ),
			'templates/page': elementor.translate( 'pages' ),
			'templates/my-templates': elementor.translate( 'my_templates' ),
		};

		this.docLibraryConfig = elementor.config.document.remoteLibrary;

		if ( 'block' === this.docLibraryConfig.type ) {
			this.setDefault( 'templates/block' );
		} else {
			this.setDefault( 'templates/page' );
		}
	}

	open() {
		this.parent.startModal();

		return true;
	}

	close() {
		this.parent.modalConfig = {};
	}

	getTabsWrapperSelector() {
		return '#elementor-template-library-header-menu';
	}

	activateTab( tab ) {
		if ( 'templates/my-templates' === tab ) {
			this.parent.setScreen( 'local' );
		} else {
			this.parent.setScreen( 'remote', tab.replace( 'templates/', '' ) );
		}

		elementorCommon.route.saveState( 'library' );

		super.activateTab( tab );
	}

	getRoutes() {
		return {
			import: () => {
				this.parent.getLayout().showImportView();
			},

			'save-template': ( args ) => {
				this.parent.getLayout().showSaveTemplateView( args.model );
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

	show( args ) {
		this.parent.modalConfig = args;

		if ( args.toDefault || ! elementorCommon.route.restoreState( 'library' ) ) {
			elementorCommon.route.to( this.getDefault(), {
				onAfter: () => {
					if ( this.docLibraryConfig.category ) {
						this.parent.setFilter( 'subtype', this.docLibraryConfig.category );
					}
				},
			} );
		}
	}
}
