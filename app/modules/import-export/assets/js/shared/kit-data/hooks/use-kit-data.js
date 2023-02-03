import { useMemo } from 'react';

export default function useKitData( kitData ) {
	const getLabel = ( type, key, amount ) => {
		// The summary-titles data will not exist in the kitData as part of the export process, and therefore should be taken from the elementorAppConfig.
		const summaryTitlesData = kitData?.configData?.summaryTitles || elementorAppConfig[ 'import-export' ].summaryTitles,
			label = summaryTitlesData[ type ][ key ];

		if ( label?.single ) {
			if ( ! amount ) {
				return '';
			}

			const title = amount > 1 ? label.plural : label.single;

			return amount + ' ' + title;
		}

		return label;
	},
	getTemplates = () => {
		const templates = {};

		for ( const key in kitData?.templates ) {
			const type = kitData.templates[ key ].doc_type;

			if ( ! templates[ type ] ) {
				templates[ type ] = 0;
			}

			templates[ type ]++;
		}

		return Object
			.entries( templates )
			.map( ( [ key, amount ] ) => getLabel( 'templates', key, amount ) )
			.filter( ( value ) => value );
	},
	getSiteSettings = () => {
		const siteSettings = kitData?.[ 'site-settings' ] || {};

		return Object
			.values( siteSettings )
			.map( ( item ) => getLabel( 'site-settings', item ) );
	},
	getContent = () => {
		const content = kitData?.content || {},
			wpContent = kitData?.[ 'wp-content' ] || {};

		let mergedContent = { ...content };

		for ( const key in mergedContent ) {
			mergedContent[ key ] = Object.keys( mergedContent[ key ] ).concat( wpContent[ key ] || [] );
		}

		// In case that wpContent has properties that doesn't exist in the content object.
		mergedContent = { ...wpContent, ...mergedContent };

		return Object
			.entries( mergedContent )
			.map( ( [ key, data ] ) => getLabel( 'content', key, data.length ) )
			.filter( ( value ) => value );
	},
	getPlugins = () => {
		return kitData?.plugins ? kitData.plugins.map( ( { name } ) => name ) : [];
	};

	return useMemo( () => ( {
		templates: getTemplates(),
		siteSettings: getSiteSettings(),
		content: getContent(),
		plugins: getPlugins(),
	} ), [ kitData ] );
}
