import HookDependency from 'elementor-api/modules/hook-base/dependency';
import DocumentUtils from 'elementor-api/utils/document';

export class IsValidChild extends HookDependency {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'is-valid-child';
	}

	apply( args ) {
		const { containers = [ args.container ], model = {} } = args,
			modelToCreate = new Backbone.Model( model );

		return containers.some( ( /* Container */ container ) => (
			DocumentUtils.isValidChild( modelToCreate, container.model )
		) );
	}
}

export default IsValidChild;
