import Command from 'elementor-api/modules/command';

export class NavigateUp extends Command {
	apply() {
		this.component.getItemsView().activateNextItem( true );
	}
}

export default NavigateUp;
