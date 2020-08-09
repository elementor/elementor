import Command from 'elementor-api/modules/command';

export class NavigateDown extends Command {
	apply() {
		this.component.getItemsView().activateNextItem();
	}
}

export default NavigateDown;
