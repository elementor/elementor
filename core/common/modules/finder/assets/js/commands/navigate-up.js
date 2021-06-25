import CommandBase from 'elementor-api/modules/command-base';

export class NavigateUp extends CommandBase {
	apply() {
		this.component.getItemsView().activateNextItem( true );
	}
}

export default NavigateUp;
