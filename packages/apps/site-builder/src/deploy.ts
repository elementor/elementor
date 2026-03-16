type SiteBuilderConfig = NonNullable< NonNullable< typeof window.elementorAppConfig >[ 'site-builder' ] >;

interface DeployPage {
	id: string;
	title: string;
	content: object[];
}

interface DeployThemePart {
	title: string;
	type: 'header' | 'footer' | 'error-404' | 'single-post';
	content: object[];
	themeBuilderCondition?: string;
}

interface DeploySamplePost {
	title: string;
	content: string;
}

interface DeployLogo {
	url: string;
	filename: string;
}

interface DeployMenuItem {
	title: string;
	pageId: string;
}

interface DeployPayload {
	pages: DeployPage[];
	header?: DeployThemePart;
	footer?: DeployThemePart;
	error404?: DeployThemePart;
	singlePost?: DeployThemePart;
	kitSettings: Record< string, unknown >;
	menus: {
		header: DeployMenuItem[];
		footer: DeployMenuItem[];
	};
	siteMeta: {
		title: string;
		tagline: string;
	};
	logo?: DeployLogo;
	samplePosts?: DeploySamplePost[];
}

interface DeployResult {
	status: 'success' | 'error';
	homeUrl?: string;
	homePageId?: number;
	error?: string;
	errors?: string[];
}

interface WpPost {
	id: number;
}

interface ElementorSetting {
	success: boolean;
	data?: { value: unknown };
}

interface WpMenu {
	id: number;
}

// ────────────────────────────────────────────────────
// REST helper
// ────────────────────────────────────────────────────

async function wpFetch< T >(
	config: SiteBuilderConfig,
	path: string,
	options: RequestInit = {},
): Promise< T > {
	const url = config.wpRestUrl + path;

	const headers: Record< string, string > = {
		'X-WP-Nonce': config.nonce,
		...( options.headers as Record< string, string > || {} ),
	};

	if ( ! headers[ 'Content-Type' ] && options.body && typeof options.body === 'string' ) {
		headers[ 'Content-Type' ] = 'application/json';
	}

	const response = await fetch( url, { ...options, headers } );

	if ( ! response.ok ) {
		const text = await response.text().catch( () => '' );
		throw new Error( `${ options.method || 'GET' } ${ path } → ${ response.status }: ${ text.slice( 0, 200 ) }` );
	}

	return response.json() as Promise< T >;
}

// ────────────────────────────────────────────────────
// Step 1 — Site metadata
// ────────────────────────────────────────────────────

async function setSiteMetadata( config: SiteBuilderConfig, siteMeta: DeployPayload[ 'siteMeta' ] ) {
	await wpFetch( config, 'wp/v2/settings', {
		method: 'POST',
		body: JSON.stringify( {
			title: siteMeta.title,
			description: siteMeta.tagline,
		} ),
	} );
}

// ────────────────────────────────────────────────────
// Step 2 — Logo upload
// ────────────────────────────────────────────────────

async function uploadLogo( config: SiteBuilderConfig, logo: DeployLogo ) {
	const imageResponse = await fetch( logo.url );

	if ( ! imageResponse.ok ) {
		throw new Error( `Failed to download logo: ${ imageResponse.status }` );
	}

	const imageBlob = await imageResponse.blob();

	const media = await wpFetch< WpPost >( config, 'wp/v2/media', {
		method: 'POST',
		headers: {
			'Content-Disposition': `attachment; filename="${ logo.filename }"`,
			'Content-Type': imageBlob.type || 'image/png',
		},
		body: imageBlob as unknown as string,
	} );

	await wpFetch( config, 'wp/v2/settings', {
		method: 'POST',
		body: JSON.stringify( { site_logo: media.id } ),
	} );
}

// ────────────────────────────────────────────────────
// Step 3 — Kit settings (colors, typography)
// ────────────────────────────────────────────────────

async function updateKitSettings( config: SiteBuilderConfig, kitSettings: Record< string, unknown > ) {
	const res = await wpFetch< ElementorSetting >(
		config,
		'elementor/v1/settings/elementor_active_kit',
	);

	const kitId = res?.data?.value;

	if ( ! kitId ) {
		throw new Error( 'Could not resolve active kit ID' );
	}

	await wpFetch( config, `wp/v2/elementor_library/${ kitId }`, {
		method: 'POST',
		body: JSON.stringify( {
			meta: { _elementor_page_settings: kitSettings },
		} ),
	} );
}

// ────────────────────────────────────────────────────
// Step 4 — Create pages
// ────────────────────────────────────────────────────

async function createPages( config: SiteBuilderConfig, pages: DeployPage[] ) {
	const pageIdMap: Record< string, number > = {};

	for ( const page of pages ) {
		const created = await wpFetch< WpPost >( config, 'wp/v2/pages', {
			method: 'POST',
			body: JSON.stringify( {
				title: page.title,
				status: 'publish',
				meta: {
					_elementor_edit_mode: 'builder',
					_elementor_template_type: 'wp-page',
					_elementor_data: JSON.stringify( page.content ),
				},
			} ),
		} );

		pageIdMap[ page.id ] = created.id;

		triggerMediaImport( config, created.id );
	}

	return pageIdMap;
}

// ────────────────────────────────────────────────────
// Step 5 — Set home page
// ────────────────────────────────────────────────────

async function setHomePage( config: SiteBuilderConfig, homePageWpId: number ) {
	await wpFetch( config, 'wp/v2/settings', {
		method: 'POST',
		body: JSON.stringify( {
			page_on_front: homePageWpId,
			show_on_front: 'page',
		} ),
	} );
}

// ────────────────────────────────────────────────────
// Step 6 — Theme parts (header, footer, 404, single)
// ────────────────────────────────────────────────────

interface ThemePartEntry {
	key: string;
	part: DeployThemePart;
}

interface OptionsSchema {
	schema?: {
		properties?: {
			meta?: {
				properties?: {
					_elementor_template_type?: {
						enum?: string[];
					};
				};
			};
		};
	};
}

async function getSupportedDocumentTypes( config: SiteBuilderConfig ): Promise< string[] > {
	try {
		const schema = await wpFetch< OptionsSchema >( config, 'wp/v2/elementor_library', {
			method: 'OPTIONS',
		} );
		return schema?.schema?.properties?.meta?.properties?._elementor_template_type?.enum || [];
	} catch {
		return [];
	}
}

async function createThemeParts( config: SiteBuilderConfig, parts: ThemePartEntry[] ) {
	const supportedTypes = await getSupportedDocumentTypes( config );
	const supported = parts.filter( ( { part } ) => supportedTypes.includes( part.type ) );

	if ( ! supported.length ) {
		return;
	}

	const templateIds: Record< string, number > = {};

	for ( const { key, part } of supported ) {
		const created = await wpFetch< WpPost >( config, 'wp/v2/elementor_library', {
			method: 'POST',
			body: JSON.stringify( {
				title: part.title,
				status: 'publish',
				meta: {
					_elementor_edit_mode: 'builder',
					_elementor_template_type: part.type,
					_elementor_data: JSON.stringify( part.content ),
					_elementor_conditions: part.themeBuilderCondition || 'include/general',
				},
			} ),
		} );

		templateIds[ key ] = created.id;

		triggerMediaImport( config, created.id );
	}

	const conditions: Record< string, Record< number, string[] > > = {};

	for ( const { key, part } of supported ) {
		const tid = templateIds[ key ];
		if ( ! tid ) {
			continue;
		}

		const conditionValue = part.themeBuilderCondition || 'include/general';

		let bucket: string;
		if ( part.type === 'header' ) {
			bucket = 'header';
		} else if ( part.type === 'footer' ) {
			bucket = 'footer';
		} else {
			bucket = 'single';
		}

		if ( ! conditions[ bucket ] ) {
			conditions[ bucket ] = {};
		}
		conditions[ bucket ][ tid ] = [ conditionValue ];
	}

	await wpFetch( config, 'elementor/v1/settings/elementor_pro_theme_builder_conditions', {
		method: 'POST',
		body: JSON.stringify( { value: conditions } ),
	} );
}

// ────────────────────────────────────────────────────
// Step 7 — Sample posts
// ────────────────────────────────────────────────────

async function createSamplePosts( config: SiteBuilderConfig, posts: DeploySamplePost[] ) {
	for ( const post of posts ) {
		await wpFetch( config, 'wp/v2/posts', {
			method: 'POST',
			body: JSON.stringify( {
				title: post.title,
				content: post.content,
				status: 'publish',
			} ),
		} );
	}
}

// ────────────────────────────────────────────────────
// Step 8 — Menus
// ────────────────────────────────────────────────────

async function createMenu(
	config: SiteBuilderConfig,
	name: string,
	items: DeployMenuItem[],
	pageIdMap: Record< string, number >,
	location: string,
) {
	const menu = await wpFetch< WpMenu >( config, 'wp/v2/menus', {
		method: 'POST',
		body: JSON.stringify( {
			name,
			auto_add: false,
			locations: [ location ],
		} ),
	} );

	const menuItemPromises = items.map( ( item, index ) => {
		const objectId = pageIdMap[ item.pageId ];

		if ( ! objectId ) {
			return Promise.resolve();
		}

		return wpFetch( config, 'wp/v2/menu-items', {
			method: 'POST',
			body: JSON.stringify( {
				title: item.title,
				object_id: objectId,
				menus: menu.id,
				object: 'page',
				type: 'post_type',
				status: 'publish',
				menu_order: index + 1,
				parent: 0,
			} ),
		} );
	} );

	await Promise.all( menuItemPromises );
}

async function createMenus(
	config: SiteBuilderConfig,
	menus: DeployPayload[ 'menus' ],
	pageIdMap: Record< string, number >,
) {
	if ( menus.header?.length ) {
		await createMenu( config, `Header-${ Date.now() }`, menus.header, pageIdMap, 'primary' );
	}

	if ( menus.footer?.length ) {
		await createMenu( config, `Footer-${ Date.now() }`, menus.footer, pageIdMap, 'footer' );
	}
}

// ────────────────────────────────────────────────────
// Media import (fire-and-forget)
// ────────────────────────────────────────────────────

function triggerMediaImport( config: SiteBuilderConfig, postId: number ) {
	wpFetch( config, `elementor/v1/documents/${ postId }/media/import`, {
		method: 'POST',
		body: JSON.stringify( { id: postId } ),
	} ).catch( () => {
		/* intentionally swallowed — media import is best-effort */
	} );
}

// ────────────────────────────────────────────────────
// Orchestrator
// ────────────────────────────────────────────────────

export async function deployWebsite(
	config: SiteBuilderConfig,
	payload: DeployPayload,
): Promise< DeployResult > {
	const errors: string[] = [];

	// Step 1
	try {
		await setSiteMetadata( config, payload.siteMeta );
	} catch ( e ) {
		errors.push( `site_metadata: ${ ( e as Error ).message }` );
	}

	// Step 2
	if ( payload.logo ) {
		try {
			await uploadLogo( config, payload.logo );
		} catch ( e ) {
			errors.push( `logo: ${ ( e as Error ).message }` );
		}
	}

	// Step 3
	try {
		await updateKitSettings( config, payload.kitSettings );
	} catch ( e ) {
		errors.push( `kit_settings: ${ ( e as Error ).message }` );
	}

	// Step 4
	let pageIdMap: Record< string, number > = {};
	try {
		pageIdMap = await createPages( config, payload.pages );
	} catch ( e ) {
		errors.push( `pages: ${ ( e as Error ).message }` );
	}

	// Step 5
	const homeWpId = pageIdMap.home;
	if ( homeWpId ) {
		try {
			await setHomePage( config, homeWpId );
		} catch ( e ) {
			errors.push( `home_page: ${ ( e as Error ).message }` );
		}
	}

	// Step 6
	const themeParts: ThemePartEntry[] = [];
	if ( payload.header ) {
		themeParts.push( { key: 'header', part: payload.header } );
	}
	if ( payload.footer ) {
		themeParts.push( { key: 'footer', part: payload.footer } );
	}
	if ( payload.error404 ) {
		themeParts.push( { key: 'error404', part: payload.error404 } );
	}
	if ( payload.singlePost ) {
		themeParts.push( { key: 'singlePost', part: payload.singlePost } );
	}

	if ( themeParts.length ) {
		try {
			await createThemeParts( config, themeParts );
		} catch ( e ) {
			errors.push( `theme_parts: ${ ( e as Error ).message }` );
		}
	}

	// Step 7
	if ( payload.samplePosts?.length ) {
		try {
			await createSamplePosts( config, payload.samplePosts );
		} catch ( e ) {
			errors.push( `sample_posts: ${ ( e as Error ).message }` );
		}
	}

	// Step 8
	try {
		await createMenus( config, payload.menus, pageIdMap );
	} catch ( e ) {
		errors.push( `menus: ${ ( e as Error ).message }` );
	}

	return {
		status: errors.length ? 'error' : 'success',
		homeUrl: window.location.origin,
		homePageId: pageIdMap.home || 0,
		...( errors.length ? { errors, error: errors[ 0 ] } : {} ),
	};
}
