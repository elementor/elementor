import CommandsBase from './base';

export class Create extends CommandsBase {
	apply( args ) {
		const manager = this.component.manager;

		return manager.typeInstance( args.type )?.create( args.favorite );
	}
}

export default Create;
