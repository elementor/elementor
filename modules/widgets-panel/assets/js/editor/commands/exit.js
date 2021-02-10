import CommandBase from 'elementor-api/modules/command-base';

export class Exit extends CommandBase {
	apply() {
		jQuery( `#${ this.component.$favoriteMenuId }` ).remove();
	}
}

export default Exit;
