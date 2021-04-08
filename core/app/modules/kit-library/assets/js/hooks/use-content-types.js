import { useQuery } from 'react-query';
import ContentType from '../models/content-type';

export const KEY = 'content-types';

export default function useContentTypes() {
	return useQuery( [ KEY ], fetchContentTypes );
}

function fetchContentTypes() {
	return Promise.resolve( [
		{
			id: 'site-parts',
			label: __( 'Site Parts', 'elementor' ),
			doc_types: [ 'header', 'footer', 'single', 'archive', '404' ],
			order: 1,
		},
		{
			id: 'page',
			label: __( 'Pages', 'elementor' ),
			doc_types: [ 'page' ],
			order: 0,
		},
		{
			id: 'popup',
			label: __( 'Popups', 'elementor' ),
			doc_types: [ 'popup' ],
			order: 2,
		},
	] ).then( ( data ) => {
		return data.map( ( contentType ) => ContentType.createFromResponse( contentType ) );
	} );
}
