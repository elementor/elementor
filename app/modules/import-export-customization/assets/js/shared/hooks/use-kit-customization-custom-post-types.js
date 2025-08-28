import { useMemo } from 'react';
import { useCustomPostTypes } from './use-custom-post-types';

export function useKitCustomizationCustomPostTypes( { data } ) {
	const isImport = data?.hasOwnProperty( 'uploadedData' );

	const { customPostTypes: builtInCustomPostTypes } = useCustomPostTypes( { include: [ 'post' ] } );

	const customPostTypes = useMemo( () => {
		if ( ! isImport ) {
			return builtInCustomPostTypes;
		}

		const customPostTypesFromTitle = Object.values( data?.uploadedData?.manifest?.[ 'custom-post-type-title' ] || {} ).map( ( postType ) => {
			return {
				value: postType.name,
				label: postType.label,
			};
		} );

		const wpContent = data?.uploadedData?.manifest?.[ 'wp-content' ] || {};
		const content = data?.uploadedData?.manifest?.content || {};

		const postWpContent = wpContent?.post;
		const postContent = content?.post;
		const hasPostWpContent = postWpContent && Array.isArray( postWpContent ) && postWpContent.length > 0;
		const hasPostContent = postContent && 'object' === typeof postContent && Object.keys( postContent ).length > 0;

		if ( hasPostWpContent || hasPostContent ) {
			if ( ! customPostTypesFromTitle.some( ( postType ) => 'post' ===postType.value ) ) {
			customPostTypesFromTitle.push( {
					value: 'post',
					label: 'Post',
				} );
			}
		}

		return customPostTypesFromTitle;
	}, [ isImport, data?.uploadedData, builtInCustomPostTypes ] );

	return {
		customPostTypes,
	};
}
