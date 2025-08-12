import { useMemo } from 'react';
import { useCustomPostTypes } from './use-custom-post-types';

export function useKitCustomizationCustomPostTypes( { data } ) {
	const isImport = data?.hasOwnProperty( 'uploadedData' );

	const { customPostTypes: builtInCustomPostTypes } = useCustomPostTypes( { include: [ 'post' ] } );

	const customPostTypes = useMemo( () => {
		if ( ! isImport ) {
			return builtInCustomPostTypes;
		}

		return Object.values( data?.uploadedData?.manifest?.[ 'custom-post-type-title' ] || {} ).map( ( postType ) => {
			return {
				value: postType.name,
				label: postType.label,
			};
		} );
	}, [ isImport, data?.uploadedData, builtInCustomPostTypes ] );

	return {
		customPostTypes,
	};
}
