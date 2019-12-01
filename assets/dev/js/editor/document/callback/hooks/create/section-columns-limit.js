import HookDependency from '../base/dependency';

export class SectionColumnsLimit extends HookDependency {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'section-columns-limit';
	}

	getConditions( args ) {
		return args.model && 'column' === args.model.elType;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		// If one of the targets have maximum columns reached break the command.
		return ! containers.some( ( /**Container*/ container ) => {
			return container.view.isCollectionFilled();
		} );
	}
}

export default SectionColumnsLimit;
