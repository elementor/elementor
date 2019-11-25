import HookDependency from '../base/dependency';

export class SectionColumnsLimit extends HookDependency {
	command() {
		return 'document/elements/create';
	}

	id() {
		return 'section-columns-limit';
	}

	conditions( args ) {
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
