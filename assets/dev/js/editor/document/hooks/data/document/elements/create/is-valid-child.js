import Dependency from 'elementor-api/modules/hooks/data/dependency';
import DocumentHelper from 'elementor-document/helper';

export class IsValidChild extends Dependency {
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
			DocumentHelper.isValidChild( modelToCreate, container.model )
		) );
	}
}

export default IsValidChild;
