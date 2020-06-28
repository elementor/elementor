import Command from 'elementor-api/modules/command';

export class Toggle extends Command {
	apply() {
		elementor.getPanelView().modeSwitcher.currentView.toggleMode();
	}
}

export default Toggle;

