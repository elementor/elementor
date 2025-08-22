import { BaseRegistry } from './base';
class SiteSettingsRegistry extends BaseRegistry {
	getState( data, parentInitialState ) {
		const state = {};

		this.getAll().forEach( ( section ) => {
			if ( section.children ) {
				section.children?.forEach( ( childSection ) => {
					const sectionState = this.getSectionState( childSection, data, parentInitialState );

					Object.assign( state, sectionState );
				} );
			} else {
				Object.assign( state, this.getSectionState( section, data, parentInitialState ) );
			}
		} );

		return state;
	}

	getSectionState( section, data, parentInitialState ) {
		const state = {};

		const isImport = data?.hasOwnProperty( 'uploadedData' );

		if ( isImport ) {
			state[ section.key ] = data?.uploadedData?.manifest?.[ 'site-settings' ]?.[ section.key ];
			return state;
		}

		if ( data?.customization?.settings?.[ section.key ] !== undefined ) {
			state[ section.key ] = data.customization.settings[ section.key ];
			return state;
		}

		if ( section.getInitialState ) {
			state[ section.key ] = section.getInitialState( data, parentInitialState );
			return state;
		}

		state[ section.key ] = section.useParentDefault ? parentInitialState : false;

		return state;
	}
}

export const siteSettingsRegistry = new SiteSettingsRegistry();
