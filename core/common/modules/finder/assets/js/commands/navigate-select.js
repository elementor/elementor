import Command from 'elementor-api/modules/command';

export class NavigateSelect extends Command {
	apply( args ) {
		this.component.getItemsView().goToActiveItem( args );
	}
}

export default NavigateSelect;
