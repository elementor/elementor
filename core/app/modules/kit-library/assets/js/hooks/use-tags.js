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
					text: 'Hotels',
					type: 'categories',
				},
				{
					text: 'Restaurants',
					type: 'categories',
				},
				{
					text: 'Fun',
					type: 'tags',
				},
				{
					text: 'Fun1',
					type: 'tags',
				},
				{
					text: 'Fun2',
					type: 'tags',
				},
				{
					text: 'Fun3',
					type: 'tags',
				},
				{
					text: 'Fun4',
					type: 'tags',
				},
				{
					text: 'Fun5',
					type: 'tags',
				},
				{
					text: 'Fun6',
					type: 'tags',
				},
				{
					text: 'Fun7',
					type: 'tags',
				},
				{
					text: 'Fun8',
					type: 'tags',
				},
				{
					text: 'Fun9',
					type: 'tags',
				},
				{
					text: 'Fun10',
					type: 'tags',
				},
				{
					text: 'Fun11',
					type: 'tags',
				},
				{
					text: 'Fun12',
					type: 'tags',
				},
				{
					text: 'Fun13',
					type: 'tags',
				},
				{
					text: 'Fun14',
					type: 'tags',
				},
				{
					text: 'Fun15',
					type: 'tags',
				},
				{
					text: 'Fun16',
					type: 'tags',
				},
				{
					text: 'Fun17',
					type: 'tags',
				},
			],
		},
	} )
		.then( ( response ) => response.data )
		.then( ( { data } ) => data.map( ( tag ) => Tag.createFromResponse( tag ) ) );
}
