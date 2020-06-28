import Command from 'elementor-api/modules/command';

export class Select extends Command {
	apply( args ) {
		this.component.getItemsView().goToActiveItem( args );
	}
}

export default Select;
