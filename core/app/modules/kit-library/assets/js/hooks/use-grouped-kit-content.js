import useContentTypes from './use-content-types';

const { useMemo } = React;

export default function useGroupedKitContent( kit ) {
	const contentTypesQuery = useContentTypes();

	const data = useMemo( () => {
		if ( ! kit || ! contentTypesQuery.data ) {
			return [];
		}

		return kit.getGroupedDocumentsByContentTypes( contentTypesQuery.data )
			.sort( ( a, b ) => a.order - b.order );
	}, [ kit, contentTypesQuery.data ] );

	return {
		...contentTypesQuery,
		data,
	};
}
