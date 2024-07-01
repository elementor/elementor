import fs from 'fs';
import { type APIRequestContext, APIResponse } from '@playwright/test';
import { Image, Post, WpPage } from '../types/types';

export default class ApiRequests {
	private readonly nonce: string;
	private readonly baseUrl: string;
	constructor( baseUrl: string, nonce: string ) {
		this.nonce = nonce;
		this.baseUrl = baseUrl;
	}

	public async create( request: APIRequestContext, entity: string, data: Post ) {
		const response = await request.post( `${ this.baseUrl }/index.php`, {
			params: { rest_route: `/wp/v2/${ entity }` },
			headers: {
				'X-WP-Nonce': this.nonce,
			},
			multipart: data,
		} );

		if ( ! response.ok() ) {
			throw new Error( `
				Failed to create a ${ entity }: ${ response.status() }.
				${ await response.text() }
				${ response.url() }
				TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
				NONCE: ${ this.nonce }
			` );
		}
		const { id } = await response.json();

		return id;
	}

	public async createMedia( request: APIRequestContext, image: Image ) {
		const imagePath = image.filePath;
		const response = await request.post( `${ this.baseUrl }/index.php`, {

			params: { rest_route: '/wp/v2/media' },
			headers: {
				'X-WP-Nonce': this.nonce,
			},
			multipart: {
				file: fs.createReadStream( imagePath ),
				title: image.title,
				status: 'publish',
				description: image.description,
				alt_text: image.alt_text,
				caption: image.caption,
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `
			Failed to create default media: ${ response.status() }.
			${ await response.text() }
		` );
		}

		const { id } = await response.json();

		return id;
	}

	public async deleteMedia( request: APIRequestContext, ids: string[] ) {
		const requests = [];

		for ( const id in ids ) {
			requests.push( request.delete( `${ this.baseUrl }/index.php`, {
				headers: {
					'X-WP-Nonce': this.nonce,
				},
				params: {
					rest_route: `/wp/v2/media/${ ids[ id ] }`,
					force: 1,
				},
			} ) );
		}

		await Promise.all( requests );
	}

	public async cleanUpTestPages( request: APIRequestContext ) {
		const pagesPublished = await this.getPages( request ),
			pagesDraft = await this.getPages( request, 'draft' ),
			pages = [ ...pagesPublished, ...pagesDraft ];

		const pageIds = pages
			.filter( ( page: WpPage ) => page.title.rendered.includes( 'Playwright Test Page' ) )
			.map( ( page: WpPage ) => page.id );

		for ( const id of pageIds ) {
			await this.deletePage( request, id );
		}
	}

	public async getPlugins( request: APIRequestContext ) {
		const response = await request.get( `${ this.baseUrl }/index.php`, {
			params: {
				rest_route: `/wp/v2/plugins`,
			},
			headers: {
				'X-WP-Nonce': this.nonce,
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `
			Failed to get plugins: ${ response.status() }.
			${ await response.text() }
		` );
		}

		return await response.json();
	}

	public async installPlugin( request: APIRequestContext, slug: string, active: boolean ) {
		const response = await request.post( `${ this.baseUrl }/index.php`, {
			params: {
				rest_route: `/wp/v2/plugins`,
				slug,
				status: active ? 'active' : 'inactive',
			},
			headers: {
				'X-WP-Nonce': this.nonce,
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `
				Failed to install a plugin: ${ response ? response.status() : '<no status>' }.
				${ response ? await response.text() : '<no response>' }
				slug: ${ slug }
			` );
		}
		const { id } = await response.json();

		return id;
	}

	public async deactivatePlugin( request: APIRequestContext, slug: string ) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const plugins: Array<any> = await this.getPlugins( request );
		const filteredPlugins = plugins.filter( ( pluginData ) => {
			return pluginData.textdomain === slug;
		} );

		let response: APIResponse;
		if ( filteredPlugins.length > 0 ) {
			response = await request.post( `${ this.baseUrl }/index.php`, {
				params: {
					rest_route: `/wp/v2/plugins/${ filteredPlugins[ 0 ].plugin }`,
					status: 'inactive',
				},
				headers: {
					'X-WP-Nonce': this.nonce,
				},
			} );
		}
		if ( 0 === filteredPlugins.length || ! response || ! response.ok() ) {
			throw new Error( `
				Failed to deactivate a plugin: ${ response ? response.status() : '<no status>' }.
				${ response ? await response.text() : '<no response>' }
				${ JSON.stringify( plugins ) }
				slug: ${ slug }
			` );
		}
		const { id } = await response.json();

		return id;
	}

	public async deletePlugin( request: APIRequestContext, slug: string ) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const plugins: Array<any> = await this.getPlugins( request );
		const filteredPlugins = plugins.filter( ( pluginData ) => {
			return pluginData.textdomain === slug;
		} );

		const response = await this._delete( request, 'plugins', `${ filteredPlugins[ 0 ].plugin }` );

		if ( ! response.ok() ) {
			throw new Error( `
				Failed to delete a plugin: ${ response ? response.status() : '<no status>' }.
				${ response ? await response.text() : '<no response>' }
				${ JSON.stringify( plugins ) }
				slug: ${ slug }
			` );
		}
		const { id } = await response.json();

		return id;
	}

	private async get( request: APIRequestContext, entity: string, status: string = 'publish' ) {
		const response = await request.get( `${ this.baseUrl }/index.php`, {
			params: {
				rest_route: `/wp/v2/${ entity }`,
				status,
			},
			headers: {
				'X-WP-Nonce': this.nonce,
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `
			Failed to get a ${ entity }: ${ response.status() }.
			${ await response.text() }
		` );
		}

		return await response.json();
	}

	private async getPages( request: APIRequestContext, status: string = 'publish' ) {
		return await this.get( request, 'pages', status );
	}

	private async deletePage( request: APIRequestContext, pageId: string ) {
		await this._delete( request, 'pages', pageId );
	}

	private async _delete( request: APIRequestContext, entity: string, id: string ) {
		const response = await request.delete( `${ this.baseUrl }/index.php`, {
			params: { rest_route: `/wp/v2/${ entity }/${ id }` },
			headers: {
				'X-WP-Nonce': this.nonce,
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `
			Failed to delete a ${ entity } with id '${ id }': ${ response.status() }.
			${ await response.text() }
		` );
		}

		return response;
	}
}
