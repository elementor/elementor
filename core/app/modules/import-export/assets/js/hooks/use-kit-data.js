export default function useKitData( kitData, assetsLabels ) {
	const getLabel = ( type, key, amount ) => {
		const label = assetsLabels[ type ][ key ];

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
			.map( ( item ) => getLabel( 'templates', item[ 0 ], item[ 1 ] ) );
	},
	getSiteSettings = () => {
		const siteSettings = kitData?.[ 'site-settings' ] || {};

		return Object
			.entries( siteSettings )
			.map( ( item ) => getLabel( 'site-settings', item[ 1 ] ) );
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
			.map( ( item ) => getLabel( 'content', item[ 0 ], item[ 1 ].length ) );
	},
	getPlugins = () => {
		return kitData?.plugins ? kitData.plugins.map( ( { name } ) => name ) : [];
	};

	return {
		templates: getTemplates(),
		siteSettings: getSiteSettings(),
		content: getContent(),
		plugins: getPlugins(),
	};
}
