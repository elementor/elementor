import Command from 'elementor-api/modules/command';

export class Down extends Command {
	apply() {
		this.component.getItemsView().activateNextItem();
	}
}

export default Down;
