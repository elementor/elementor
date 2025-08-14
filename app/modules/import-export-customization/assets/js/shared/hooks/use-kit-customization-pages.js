import { useMemo } from 'react';
import { usePages } from './use-pages';

export function useKitCustomizationPages( { data, open } ) {
	const isImport = data?.hasOwnProperty( 'uploadedData' );

	const { isLoading, pageOptions: loadedPagesOptions, isLoaded } = usePages( { skipLoading: isImport || ! open } );

	const pageOptions = useMemo( () => {
		if ( ! isImport ) {
			return loadedPagesOptions;
		}

		return Object.entries( data?.uploadedData?.manifest?.content?.page || {} ).map( ( [ id, page ] ) => {
			return { value: id, label: page.title };
		} );
	}, [ loadedPagesOptions, isImport, data?.uploadedData ] );

	return {
		isLoading,
		pageOptions,
		isLoaded,
	};
}
