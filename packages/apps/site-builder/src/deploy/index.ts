import { deployGlobalClasses } from './steps/global-classes';
import { deployGlobalVariables } from './steps/global-variables';
import { updateKitSettings } from './steps/kit-settings';
import { uploadLogo } from './steps/logo';
import { createMenus } from './steps/menus';
import { createPages, setHomePage } from './steps/pages';
import { createSamplePosts } from './steps/sample-posts';
import { setSiteMetadata } from './steps/site-metadata';
import type { ThemePartEntry } from './steps/theme-parts';
import { createThemeParts } from './steps/theme-parts';
import { wireMenuWidgets } from './steps/wire-menu-widgets';
import type { CreatedMenus, DeployPayload, DeployResult } from './types';

export type { DeployPayload, DeployResult };

export async function deployWebsite( payload: DeployPayload ): Promise< DeployResult > {
	const errors: string[] = [];
	const mode = payload.mode === 'incremental' ? 'incremental' : 'full';

	if ( mode === 'incremental' ) {
		if ( payload.globalVariables ) {
			try {
				await deployGlobalVariables( payload.globalVariables );
			} catch ( e ) {
				errors.push( `global_variables: ${ ( e as Error ).message }` );
			}
		}

		let pageIdMap: Record< string, number > = {};
		try {
			( { pageIdMap } = await createPages( payload.pages ) );
		} catch ( e ) {
			errors.push( `pages: ${ ( e as Error ).message }` );
		}

		return {
			status: errors.length ? 'error' : 'success',
			homeUrl: window.location.origin,
			pageIdMap,
			...( errors.length ? { errors, error: errors[ 0 ] } : {} ),
		};
	}

	if ( payload.siteMeta ) {
		try {
			await setSiteMetadata( payload.siteMeta );
		} catch ( e ) {
			errors.push( `site_metadata: ${ ( e as Error ).message }` );
		}
	}

	if ( payload.logo ) {
		try {
			await uploadLogo( payload.logo );
		} catch ( e ) {
			errors.push( `logo: ${ ( e as Error ).message }` );
		}
	}

	if ( payload.kitSettings ) {
		try {
			await updateKitSettings( payload.kitSettings );
		} catch ( e ) {
			errors.push( `kit_settings: ${ ( e as Error ).message }` );
		}
	}

	if ( payload.globalVariables ) {
		try {
			await deployGlobalVariables( payload.globalVariables );
		} catch ( e ) {
			errors.push( `global_variables: ${ ( e as Error ).message }` );
		}
	}

	if ( payload.globalClasses ) {
		try {
			await deployGlobalClasses( payload.globalClasses );
		} catch ( e ) {
			errors.push( `global_classes: ${ ( e as Error ).message }` );
		}
	}

	let pageIdMap: Record< string, number > = {};
	let pageUrlMap: Record< string, string > = {};
	try {
		( { pageIdMap, pageUrlMap } = await createPages( payload.pages ) );
	} catch ( e ) {
		errors.push( `pages: ${ ( e as Error ).message }` );
	}

	const homeWpId = resolveHomePageId( payload.pages, pageIdMap );
	if ( homeWpId ) {
		try {
			await setHomePage( homeWpId );
		} catch ( e ) {
			errors.push( `home_page: ${ ( e as Error ).message }` );
		}
	}

	let createdMenus: CreatedMenus = {};
	try {
		createdMenus = await createMenus( payload.menus, pageIdMap );
	} catch ( e ) {
		errors.push( `menus: ${ ( e as Error ).message }` );
	}

	if ( payload.header ) {
		wireMenuWidgets( payload.header.content, {
			items: payload.menus?.header ?? [],
			pageUrlMap,
			menuSlug: createdMenus.header?.slug,
		} );
	}
	if ( payload.footer ) {
		wireMenuWidgets( payload.footer.content, {
			items: payload.menus?.footer ?? [],
			pageUrlMap,
			menuSlug: createdMenus.footer?.slug,
		} );
	}

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
			await createThemeParts( themeParts );
		} catch ( e ) {
			errors.push( `theme_parts: ${ ( e as Error ).message }` );
		}
	}

	if ( payload.samplePosts?.length ) {
		try {
			await createSamplePosts( payload.samplePosts );
		} catch ( e ) {
			errors.push( `sample_posts: ${ ( e as Error ).message }` );
		}
	}

	const result: DeployResult = {
		status: errors.length ? 'error' : 'success',
		homeUrl: window.location.origin,
		homePageId: homeWpId || 0,
		pageIdMap,
		...( errors.length ? { errors, error: errors[ 0 ] } : {} ),
	};

	return result;
}

function resolveHomePageId( pages: DeployPayload[ 'pages' ], pageIdMap: Record< string, number > ): number | undefined {
	if ( pageIdMap.home ) {
		return pageIdMap.home;
	}
	const homePage = pages[ 0 ];
	if ( homePage && pageIdMap[ homePage.id ] ) {
		return pageIdMap[ homePage.id ];
	}
	return undefined;
}
