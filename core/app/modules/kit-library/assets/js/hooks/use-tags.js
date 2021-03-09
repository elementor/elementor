import { useQuery } from 'react-query';
import Tag from 'elementor/core/app/modules/kit-library/assets/js/models/tag';

export const KEY = 'tags';

export default function useTags() {
	return useQuery( [ KEY ], fetchTags );
}

function fetchTags() {
	return Promise.resolve( {
		data: {
			data: [
				{
					id: 'blog',
					label: 'Blog',
					types: [ 'tag' ],
				},
				{
					id: 'business',
					label: 'Business',
					types: [ 'tag' ],
				},
			],
		},
	} )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( tag ) => Tag.createFromResponse( tag ) ) );
}
