import CommandBase from 'elementor-api/modules/command-base';

export class Toggle extends CommandBase {
	apply() {
		elementor.getPanelView().modeSwitcher.currentView.toggleMode();
	}
}

export default Toggle;

