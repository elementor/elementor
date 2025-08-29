import { useMemo } from 'react';
import { useCustomPostTypes } from './use-custom-post-types';

export function useKitCustomizationCustomPostTypes( { data } ) {
	const isImport = data?.hasOwnProperty( 'uploadedData' );

	const { customPostTypes: builtInCustomPostTypes } = useCustomPostTypes( { include: [ 'post' ] } );

	const customPostTypes = useMemo( () => {
		if ( ! isImport ) {
			return builtInCustomPostTypes;
		}

<<<<<<< HEAD
=======
		const customPostTypesTitles = Object.values( data?.uploadedData?.manifest?.[ 'custom-post-type-title' ] || {} ).map( ( postType ) => {
			return {
				value: postType.name,
				label: postType.label,
			};
		} );

		if ( ! customPostTypesTitles.some( ( postType ) => 'post' === postType.value ) ) {
			customPostTypesTitles.push( {
				value: 'post',
				label: 'Post',
			} );
		}

>>>>>>> 5d6130b5be (Fix: Export and import all without customization missing the CPT [ED-20595] (#32511))
		const wpContent = data?.uploadedData?.manifest?.[ 'wp-content' ] || {};

<<<<<<< HEAD
		return builtInCustomPostTypes.filter( ( postType ) => {
			const contentArray = wpContent[ postType.value ];
			return contentArray && Array.isArray( contentArray ) && contentArray.length > 0;
=======
		return customPostTypesTitles.filter( ( postType ) => {
			const postTypeValue = postType.value;

			const wpContentArray = wpContent[ postTypeValue ];
			const isInWpContent = wpContentArray && Array.isArray( wpContentArray ) && wpContentArray.length > 0;

			const contentObject = content[ postTypeValue ];
			const isInElementorContent = contentObject && 'object' === typeof contentObject && Object.keys( contentObject ).length > 0;

			return isInWpContent || isInElementorContent;
>>>>>>> 5d6130b5be (Fix: Export and import all without customization missing the CPT [ED-20595] (#32511))
		} );
	}, [ isImport, data?.uploadedData, builtInCustomPostTypes ] );

	return {
		customPostTypes,
	};
}
