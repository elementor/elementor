export class Toggle extends $e.modules.CommandBase {
	apply() {
		elementor.getPanelView().modeSwitcher.currentView.toggleMode();
	}
}

export default Toggle;

