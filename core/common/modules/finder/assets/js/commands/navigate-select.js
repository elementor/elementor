import CommandBase from 'elementor-api/modules/command-base';

export class NavigateSelect extends CommandBase {
	apply( args ) {
		this.component.getItemsView().goToActiveItem( args );
	}
}

export default NavigateSelect;
