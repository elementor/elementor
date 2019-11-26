import HookDependency from '../base/dependency';
import DocumentUtils from 'elementor-document/utils/helpers';

export class IsValidChild extends HookDependency {
	command() {
		return 'document/elements/create';
	}

	id() {
		return 'is-valid-child';
	}

	conditions() {
		return true;
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
