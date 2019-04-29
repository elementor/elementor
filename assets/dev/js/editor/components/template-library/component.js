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

	getTabsGroups() {
		return {
			templates: {
				blocks: elementor.translate( 'blocks' ),
				pages: elementor.translate( 'pages' ),
				'my-templates': elementor.translate( 'my_templates' ),
			},
		};
	}

	getRoutes() {
		return {
			blocks: () => {
				this.view.setScreen( 'remote', 'block' );
				this.route.saveState();
			},

			pages: () => {
				this.view.setScreen( 'remote', 'page' );
				this.route.saveState();
			},

			'my-templates': () => {
				this.view.setScreen( 'local' );
				this.route.saveState();
			},

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
