import CommandBase from 'elementor-api/modules/command-base';

export class Down extends CommandBase {
	apply() {
		this.component.getItemsView().activateNextItem();
	}
}

export default Down;
