import CreateBase from 'elementor-editor/data/globals/base/create-base';

export class Create extends CreateBase {
	apply( args = {} ) {
		const { container, setting, title } = args,
			controls = container.controls;

		let result = false;

		if ( ! controls[ setting ] ) {
			throw new Error( `Invalid setting: control '${ setting }', not found.` );
		}

		const id = elementor.helpers.getUniqueID();

		// Currently does not affect cache.
		result = $e.data.create( `globals/colors?id=${ id }`, {
			title,
			value: container.settings.get( setting ),
		} );

		return result;
	}
}
