export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Library';
		this.namespace = 'library';

		this.tabs = {
			'templates/block': elementor.translate( 'blocks' ),
			'templates/page': elementor.translate( 'pages' ),
			'templates/my-templates': elementor.translate( 'my_templates' ),
		};

		super.init( args );
	}

	getDefault() {
		return 'library/templates/page';
	}

	open() {
		this.view.startModal();

		return true;
	}

	close() {
		this.view.modalConfig = {};
	}

	activateTab( tab ) {
		if ( 'templates/my-templates' === tab ) {
			this.view.setScreen( 'local' );
		} else {
			this.view.setScreen( 'remote', tab.replace( 'templates/', '' ) );
		}

		elementorCommon.route.saveState( 'library' );

		super.activateTab( tab );
	}

	getRoutes() {
		return {
			import: () => {
				this.view.getLayout().showImportView();
			},

			'save-template': ( args ) => {
				this.view.getLayout().showSaveTemplateView( args.model );
			},
		};
	}

	getCommands() {
		return {
			show: ( args ) => {
				this.view.modalConfig = args;

				if ( ! elementorCommon.route.restoreState( 'library' ) ) {
					elementorCommon.route.to( this.getDefault() );
				}
			},
		};
	}

	getShortcuts() {
		return {
			show: {
				keys: 'ctrl+shift+l',
				scope: [ 'global' ],
			},
		};
	}
}
