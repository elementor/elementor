import ComponentBase from 'elementor-api/modules/component-base';
import CommandBase from 'elementor-api/modules/command-base';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'panel/history/revisions';
	}

	defaultCommands() {
		const self = this;

		return {
			up: () => new class Up extends CommandBase {
				apply = () => self.navigate( true );
			},
			down: () => new class Down extends CommandBase {
				apply = () => self.navigate();
			},
		};
	}

	defaultShortcuts() {
		return {
			up: {
				keys: 'up',
				scopes: [ this.getNamespace() ],
			},
			down: {
				keys: 'down',
				scopes: [ this.getNamespace() ],
			},
		};
	}

	navigate( up ) {
		if ( elementor.documents.getCurrent().revisions.getItems().length > 1 ) {
			elementor.getPanelView().getCurrentPageView().currentTab.navigate( up );
		}
	}
}
