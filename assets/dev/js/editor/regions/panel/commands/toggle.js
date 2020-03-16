import CommandHookable from 'elementor-api/modules/command-hookable';

export class Toggle extends CommandHookable {
	apply() {
		elementor.getPanelView().modeSwitcher.currentView.toggleMode();
	}
}

export default Toggle;

