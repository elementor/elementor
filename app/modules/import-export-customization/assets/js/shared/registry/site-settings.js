import { BaseRegistry } from './base';
class SiteSettingsRegistry extends BaseRegistry {
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
