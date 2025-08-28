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
		const content = data?.uploadedData?.manifest?.[ 'content' ] || {};
		
		return builtInCustomPostTypes.filter( ( postType ) => {
			const contentArray = wpContent[ postType.value ];
			const hasWpContent = contentArray && Array.isArray( contentArray ) && contentArray.length > 0;
			
			if ( postType.value === 'post' ) {
				const postContent = content[ 'post' ];
				const hasPostContent = postContent && typeof postContent === 'object' && Object.keys( postContent ).length > 0;
				return hasWpContent || hasPostContent;
			}
			
			return hasWpContent;
		} );
	}, [ isImport, data?.uploadedData, builtInCustomPostTypes ] );

	return {
		customPostTypes,
	};
}
