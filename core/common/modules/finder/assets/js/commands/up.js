import Command from 'elementor-api/modules/command';

export class Up extends Command {
	apply() {
		this.component.getItemsView().activateNextItem( true );
	}
}

export default Up;
