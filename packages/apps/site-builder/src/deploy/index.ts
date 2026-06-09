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
import type { DeployPayload, DeployResult } from './types';

export type { DeployPayload, DeployResult };

const resolveHomeWpPageId = (
	payload: DeployPayload,
	pageIdMap: Record< string, number >,
): number | undefined => {
	const plannerHomeId = payload.homePageId ?? payload.pages[ 0 ]?.id;

	if ( ! plannerHomeId ) {
		return undefined;
	}

	return pageIdMap[ plannerHomeId ];
};

export async function deployWebsite( payload: DeployPayload ): Promise< DeployResult > {
	const errors: string[] = [];
	const isIncrementalDeploy = payload.mode === 'incremental';

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
	try {
		pageIdMap = await createPages( payload.pages );
	} catch ( e ) {
		errors.push( `pages: ${ ( e as Error ).message }` );
	}

	const homeWpId = resolveHomeWpPageId( payload, pageIdMap );
	if ( homeWpId && ! isIncrementalDeploy ) {
		try {
			await setHomePage( homeWpId );
		} catch ( e ) {
			errors.push( `home_page: ${ ( e as Error ).message }` );
		}
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

	if ( payload.menus ) {
		try {
			await createMenus( payload.menus, pageIdMap );
		} catch ( e ) {
			errors.push( `menus: ${ ( e as Error ).message }` );
		}
	}

	const editorPageId = isIncrementalDeploy ? undefined : homeWpId;

	return {
		status: errors.length ? 'error' : 'success',
		homeUrl: window.location.origin,
		homePageId: editorPageId || 0,
		pageIdMap,
		...( errors.length ? { errors, error: errors[ 0 ] } : {} ),
	};
}
