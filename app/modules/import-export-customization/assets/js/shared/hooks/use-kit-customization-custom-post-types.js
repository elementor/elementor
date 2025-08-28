import { useMemo } from 'react';
import { useCustomPostTypes } from './use-custom-post-types';

export function useKitCustomizationCustomPostTypes( { data } ) {
	const isImport = data?.hasOwnProperty( 'uploadedData' );

	const { customPostTypes: builtInCustomPostTypes } = useCustomPostTypes( { include: [ 'post' ] } );

	const customPostTypes = useMemo( () => {
		if ( ! isImport ) {
			return builtInCustomPostTypes;
		}

		const wpContent = data?.uploadedData?.manifest?.[ 'wp-content' ] || {};

		return builtInCustomPostTypes.filter( ( postType ) => {
			const contentArray = wpContent[ postType.value ];
			return contentArray && Array.isArray( contentArray ) && contentArray.length > 0;
		} );
	}, [ isImport, data?.uploadedData, builtInCustomPostTypes ] );

	return {
		customPostTypes,
	};
}
