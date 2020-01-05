import DataDependency from 'elementor-api/modules/hooks/data-base/dependency';

export class SectionColumnsLimit extends DataDependency {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'section-columns-limit';
	}

	bindContainerType() {
		return 'section';
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
