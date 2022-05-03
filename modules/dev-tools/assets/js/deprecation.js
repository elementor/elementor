import * as tools from './deprecation/utils';

export default class Deprecation {}

// Inject tools into Deprecation.
Object.keys( tools ).forEach( ( key ) => {
	Deprecation.prototype[ key ] = tools[ key ];
} );
