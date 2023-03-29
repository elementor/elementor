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
		urls: {
			rest: string,
		}
	}
}

export default async function getRecentlyEditedPosts() {
	let url: URL;
	const fetchArgs = {
		posts_per_page: 5,
	};

	try {
		const baseUrl = ( window as unknown as ExtendedWindow ).elementorWebCliConfig?.urls.rest;
		url = new URL( baseUrl + 'elementor/v1/site-navigation/recent-posts' );
	} catch ( e ) {
		return [];
	}

	Object.entries( fetchArgs ).map( ( [ key, value ] ) => url.searchParams.set( key, String( value ) ) );

	try {
		const posts = await fetch( url.toString() )
			.then( ( response ) => response.json() )
			.then( ( response ) => response as Post[] );
		return posts;
	} catch ( e ) {
		return [];
	}
}
