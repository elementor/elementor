import apiFetch from '@wordpress/api-fetch';
import type { DeploySamplePost } from '../types';

export async function createSamplePosts( posts: DeploySamplePost[] ) {
	for ( const post of posts ) {
		await apiFetch( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: {
				title: post.title,
				content: post.content,
				status: 'publish',
			},
		} );
	}
}
