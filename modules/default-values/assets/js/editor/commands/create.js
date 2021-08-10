import Base from './base';
import { pipe } from '../utils';

export class Create extends Base {
	initialize( args ) {
		if ( args.container ) {
			this.container = args.container;
		} else if ( args.containerId ) {
			this.container = elementor.getContainer( args.containerId );
		} else {
			throw new Error( 'Must pass container arg or containerId.' );
		}

		if ( this.container.settings.get( 'elType' ) !== 'widget' ) {
			throw new Error( 'Default values currently support only widgets.' );
		}
	}

	async apply() {
		// e.g: heading, button, image.
		const type = this.container.settings.get( 'widgetType' );

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave();

		// Save those settings into default entity.
		const { data } = await $e.data.create( 'default-values/index', { settings }, { type } );

		this.recreateElements( type, data.settings );
	}

	/**
	 * Get all the settings that should be save.
	 *
	 * @returns {*}
	 */
	getSettingsForSave() {
		return pipe(
			...this.component.handlers.map( ( handler ) => handler.appendSettingsForSave )
		)( {}, this.container );
	}
}

export default Create;
