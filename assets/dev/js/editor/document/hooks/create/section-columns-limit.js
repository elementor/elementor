import HookDependency from '../base/dependency';

export class SectionColumnsLimit extends HookDependency {
	hook() {
		return 'document/elements/create';
	}

	id() {
		return 'section-columns-limit';
	}

	conditioning( args ) {
		return ! args.model || 'column' !== args.model.elType;
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		return ! containers.some( ( /**Container*/ container ) => {
			return container.view.isCollectionFilled();
		} );
	}
}

export default SectionColumnsLimit;
