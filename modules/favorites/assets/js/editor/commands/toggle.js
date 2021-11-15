import CommandsBase from './base';

export class Toggle extends CommandsBase {
	apply( args ) {
		const manager = this.component.manager;

		return manager.typeInstance( args.type )?.toggle( args.favorite );
	}
}

export default Toggle;
