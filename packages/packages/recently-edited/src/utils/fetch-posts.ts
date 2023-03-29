export interface Post {
    id: number,
    title: string,
    edit_url: string,
    type: {
        post_type: string,
        doc_type: string,
        label: string,
    },
    date_modified: number,
}

type ExtendedWindow = Window & {
	elementorWebCliConfig: {
		nonce: string,
		urls: {
			rest: string,
		}
	},
	elementor: {
		config: {
			initial_document: {
				id: number
			}
		}
	}
}

export default async function getRecentlyEditedPosts() {
	let url: URL;
	const currentDocId = ( window as unknown as ExtendedWindow ).elementor?.config?.initial_document?.id;
	const nonce = ( window as unknown as ExtendedWindow ).elementorWebCliConfig?.nonce;

	if ( ! currentDocId ) {
		return [];
	}
	const fetchArgs = {
		posts_per_page: 5,
		post__not_in: currentDocId,
	};

	try {
		const baseUrl = ( window as unknown as ExtendedWindow ).elementorWebCliConfig?.urls?.rest;
		url = new URL( baseUrl + 'elementor/v1/site-navigation/recent-posts' );
	} catch ( e ) {
		return [];
	}

	Object.entries( fetchArgs ).map( ( [ key, value ] ) => url.searchParams.set( key, String( value ) ) );

	try {
		const posts = await fetch( url.toString(), {
			credentials: 'same-origin',
			headers: {
				'X-WP-Nonce': nonce,
			},
		} )
			.then( ( response ) => response.json() )
			.then( ( response ) => response as Post[] );
		return posts;
	} catch ( e ) {
		return [];
	}
}
