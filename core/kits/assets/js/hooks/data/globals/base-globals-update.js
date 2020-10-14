export class BaseGlobalsUpdate extends $e.modules.hookData.After {
	getContainerType() {
		return 'document';
	}

	getConditions() {
		return $e.routes.isPartOf( 'panel/global' );
	}

	getRepeaterName() {
		elementorModules.ForceMethodImplementation();
	}

	applyModel( model, id, value ) {
		elementorModules.ForceMethodImplementation();
	}

	apply( args, result ) {
		const { containers = [ args.container ] } = args,
			model = Object.assign( {}, result.data );

		const id = model.id,
			value = model.value;

		delete model.id;
		delete model.value;

		model._id = id;

		this.applyModel( model, value );

		containers.forEach( ( container ) => {
			$e.run( 'document/repeater/insert', {
				container,
				model,
				name: this.getRepeaterName(),
			} );
		} );
	}
}
export default BaseGlobalsUpdate;
