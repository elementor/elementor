import { BaseRegistry } from './base';

export class ContentRegistry extends BaseRegistry {
	getSectionState( section, data, parentInitialState ) {
		const state = {};

		// if ( ! section.isAvailable() || ! section.isDisabled() ) {
		// 	return state;
		// }

		const isImport = data?.hasOwnProperty( 'uploadedData' );

		if ( isImport ) {
			state[ section.key ] = this.getSectionImportState( section, data );
			return state;
		}

		if ( data?.customization?.content?.[ section.key ] !== undefined ) {
			state[ section.key ] = data.customization.content[ section.key ];
			return state;
		}

		if ( section.getInitialState ) {
			state[ section.key ] = section.getInitialState( data, parentInitialState );
			return state;
		}

		state[ section.key ] = section.useParentDefault ? parentInitialState : false;

		return state;
	}

	getSectionImportState( section, data ) {
		if ( 'pages' === section.key ) {
			return Object.entries( data?.uploadedData?.manifest?.content?.page || {} ).map( ( [ id ] ) => id );
		}

		const customPostTypes = Object.values( data?.uploadedData?.manifest?.[ 'custom-post-type-title' ] || {} ).map( ( postType ) => postType.name );

		if ( 'menus' === section.key ) {
			return Boolean( customPostTypes.find( ( cpt ) => cpt.includes( 'nav_menu' ) ) );
		}

		if ( 'customPostTypes' === section.key ) {
			return customPostTypes;
		}

		if ( 'taxonomies' === section.key ) {
			const taxonomiesList = [];

			Object.values( data?.uploadedData?.manifest?.taxonomies || {} ).forEach( ( taxonomiesListForPostType ) => {
				taxonomiesListForPostType.forEach( ( taxonomy ) => {
					if ( ! taxonomiesList.includes( taxonomy.name ) ) {
						taxonomiesList.push( taxonomy.name );
					}
				} );
			} );

			return taxonomiesList;
		}
	}
}

export const contentRegistry = new ContentRegistry();
