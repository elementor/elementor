import CommandBase from 'elementor-api/modules/command-base';

export class Select extends CommandBase {
	apply( args ) {
		this.component.getItemsView().goToActiveItem( args );
	}
}

export default Select;
