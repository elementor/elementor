import { useState, useEffect } from 'react';
export function useCustomPostTypes( { include = [] } = {} ) {
	const [ customPostTypes, setCustomPostTypes ] = useState( [] );

	useEffect( () => {
		const cpt = Object.assign( {}, elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.content?.customPostTypes || {} );

		if ( include.length ) {
			Object.entries( elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.content || {} ).forEach( ( [ postType, post ] ) => {
				if ( include.includes( postType ) ) {
					cpt[ postType ] = post;
				}
			} );
		}

		if ( Object.keys( cpt ).length ) {
			setCustomPostTypes( Object.entries( cpt ).map( ( [ postType, post ] ) => ( {
				value: postType,
				label: post.single,
			} ) ) );
		}
	}, [] );

	return { customPostTypes };
}
