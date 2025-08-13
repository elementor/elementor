import { BaseRegistry } from './base';
class TemplateRegistry extends BaseRegistry {
	getState( data, parentInitialState ) {
		const state = {};

		this.getAll().forEach( ( templateType ) => {
			if ( data?.customization?.templates?.[ templateType.key ] !== undefined ) {
				state[ templateType.key ] = data.customization.templates[ templateType.key ];
				return;
			}

			if ( templateType.getInitialState ) {
				state[ templateType.key ] = templateType.getInitialState( data, parentInitialState );
				return;
			}

			const enabled = templateType.useParentDefault ? parentInitialState : false;
			state[ templateType.key ] = { enabled };
		} );

		return state;
	}
}

export const templateRegistry = new TemplateRegistry();
