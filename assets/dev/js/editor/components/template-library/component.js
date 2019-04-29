export default class extends elementorModules.Component {
	getDefault() {
		return 'templates/pages';
	}

	open() {
		this.view.startModal();

		return true;
	}

	close() {
		this.view.modalConfig = {};
	}

	getTabs() {
		return {
			block: elementor.translate( 'blocks' ),
			page: elementor.translate( 'pages' ),
			'my-templates': elementor.translate( 'my_templates' ),
		};
	}

	activateTab( tab ) {
		if ( 'my-templates' === tab ) {
			this.view.setScreen( 'local' );
		} else {
			this.view.setScreen( 'remote', tab );
		}

		this.route.saveState();
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

				if ( ! this.route.restoreState() ) {
					this.route.to( '_default' );
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
