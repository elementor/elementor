export class Toggle extends $e.modules.CommandBase {
	apply( args ) {
		const manager = this.component.manager;

		return manager.typeInstance( args.type )?.toggle( args.favorite );
	}
}

export default Toggle;
