import Base from './base';
import { pipe } from '../utils';

export class Create extends Base {
	initialize( { containerId } ) {
		if ( containerId ) {
			this.args.container = elementor.getContainer( containerId );
		}
	}

	validateArgs( { container } ) {
		this.requireContainer();

		if ( container.settings.get( 'elType' ) !== 'widget' ) {
			throw new Error( 'Default values currently support only widgets.' );
		}
	}

	/**
	 * @param {Object} args
	 * @param {Container} args.container
	 *
	 * @returns {Promise<void>}
	 */
	async apply( { container } ) {
		// e.g: heading, button, image.
		const type = container.settings.get( 'widgetType' );

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		// Save those settings into default entity.
		const { data } = await $e.data.create( 'default-values/index', { settings }, { type } );

		this.recreateElements( type, data.settings );
	}

	/**
	 * Get all the settings that should be save.
	 *
	 * @returns {*}
	 */
	getSettingsForSave( container ) {
		const pipeFunc = pipe(
			...this.component.handlers.map( ( handler ) => handler.appendSettingsForSave )
		);

		return pipeFunc( {}, container );
	}
}

export default Create;
