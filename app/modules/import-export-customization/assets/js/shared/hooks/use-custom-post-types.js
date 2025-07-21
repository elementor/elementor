import { useState, useEffect } from 'react';
export function useCustomPostTypes() {
	const [ customPostTypes, setCustomPostTypes ] = useState( [] );

	useEffect( () => {
		const cpt = elementorAppConfig[ 'import-export-customization' ]?.summaryTitles?.content.customPostTypes;

		if ( cpt ) {
			setCustomPostTypes( Object.entries( cpt ).map( ( [ postType, post ] ) => ( {
				value: postType,
				label: post.single,
			} ) ) );
		}
	}, [] );

	return { customPostTypes };
}
