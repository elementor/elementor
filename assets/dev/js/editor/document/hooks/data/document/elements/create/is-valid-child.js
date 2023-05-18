import Dependency from 'elementor-api/modules/hooks/data/dependency';

export class IsValidChild extends Dependency {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'is-valid-child';
	}

	apply( args ) {
		const { containers = [ args.container ], model = {}, options } = args,
			modelToCreate = new Backbone.Model( model );

		return containers.some( ( /* Container */ container ) =>
			container.model.isValidChild( modelToCreate ),
		);
	}
}

export default IsValidChild;
