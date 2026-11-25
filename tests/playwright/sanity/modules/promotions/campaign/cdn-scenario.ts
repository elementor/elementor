import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { type BrowserContext, type Locator, type TestInfo, expect } from '@playwright/test';

export const ACTIVE_CAMPAIGN_SCENARIO = 'active-campaign';
export const NO_PROMOTION_SCENARIO = 'no-promotion';

const SCENARIO_COOKIE = 'e2e_cdn_scenario';
const FIXTURES_DIR = resolve( __dirname, '../../../../mu-plugins/editor-assets-cdn' );

const EDITOR_PROMOTION_NAMES = [
	'conversion-banner',
	'plugins-page',
	'pointer',
	'side-menu',
	'sticky-panel',
	'theme-builder',
] as const;

export type EditorPromotionName = typeof EDITOR_PROMOTION_NAMES[ number ];

const getEditorPromotionPath = ( name: EditorPromotionName ): string => `editor-promotions/v1/${ name }.json`;

export const EDITOR_PROMOTION_PATHS = EDITOR_PROMOTION_NAMES.map( getEditorPromotionPath );
export const NOTIFICATIONS_PATH = 'notifications/v1/notifications.json';
export const HOME_SCREEN_PATH = 'home-screen/v1/home-screen.json';
export const V4_PROMOTIONS_PATH = 'packages/v1/promotions.json';
export const UPSELL_PATH = 'free-to-pro-upsell/v1/free-to-pro-upsell.json';

export type EditorPromotion = {
	is_active?: boolean;
	[ field: string ]: string | boolean | undefined;
};

type NotificationCondition = {
	type: string;
	plugin?: string;
	operator?: string;
};

export type Notification = {
	id: string;
	title: string;
	description?: string;
	topic?: string;
	chipTags?: string[];
	cta?: string;
	ctaLink?: string;
	featured?: boolean;
	conditions?: NotificationCondition[][];
};

export type V4Promotion = {
	title?: string;
	content?: string;
	ctaUrl?: string;
	image?: string;
};

export type UpsellAsset = {
	id: string;
	imageSrc: string;
};

export type SidebarPromotionVariant = {
	license: string[];
	is_enabled: string;
	data: { image: string; link: string };
};

const readFixture = <T>( scenario: string, path: string, key: string ): T | undefined =>
	JSON.parse( readFileSync( resolve( FIXTURES_DIR, scenario, path ), 'utf8' ) )[ key ] as T | undefined;

export const assertScenarioFetched = ( scenario: string, paths: string[] ): void => {
	const missing = paths.filter( ( path ) => ! existsSync( resolve( FIXTURES_DIR, scenario, path ) ) );

	if ( missing.length ) {
		throw new Error( `CDN scenario "${ scenario }" is missing ${ missing.join( ', ' ) }. Run \`npm run test:playwright:setup-cdn\` before starting WordPress.` );
	}
};

const CDN_IMAGE_PATTERN = /^https:\/\/assets\.elementor\.com\/.+\.(?:svg|png|jpe?g|gif|webp)(?:\?.*)?$/;

// The browser loads campaign images from the CDN itself, not through the mock, so the active-campaign scenario
// answers them from its fixture without depending on the live CDN.
const serveFixtureImages = ( context: BrowserContext, scenario: string ): Promise<void> =>
	context.route( CDN_IMAGE_PATTERN, async ( route ) => {
		const file = resolve( FIXTURES_DIR, scenario, new URL( route.request().url() ).pathname.slice( 1 ) );

		if ( existsSync( file ) ) {
			await route.fulfill( { path: file } );
			return;
		}

		await route.fallback();
	} );

export const useCdnScenario = async ( context: BrowserContext, baseURL: string, scenario: string ): Promise<void> => {
	await context.addCookies( [ { name: SCENARIO_COOKIE, value: scenario, url: baseURL } ] );

	if ( ACTIVE_CAMPAIGN_SCENARIO === scenario ) {
		await serveFixtureImages( context, scenario );
	}
};

const ASSETS_ORIGIN = 'https://assets.elementor.com';
const STAGING_ASSETS_ORIGIN = 'https://assets.stg.elementor.red';
const CAMPAIGN_BASELINE_PREFIX = 'campaign';
const FINGERPRINT_LENGTH = 12;
const APPROVING_UPDATE_MODES = [ 'all', 'changed' ];

// Staging serves its images from its own host, so a campaign approved on staging keeps its fingerprint after the launch.
const getContentFingerprint = ( content: unknown ): string =>
	createHash( 'sha256' )
		.update( JSON.stringify( content ?? null ).replaceAll( STAGING_ASSETS_ORIGIN, ASSETS_ORIGIN ) )
		.digest( 'hex' )
		.slice( 0, FINGERPRINT_LENGTH );

const waitForImages = ( element: Locator ): Promise<unknown> =>
	element.locator( 'img' ).evaluateAll( ( images: HTMLImageElement[] ) => Promise.all( images
		.filter( ( image ) => ! image.complete )
		.map( ( image ) => new Promise( ( done ) => {
			image.addEventListener( 'load', done );
			image.addEventListener( 'error', done );
		} ) ) ) );

type CampaignLook = {
	scenario: string;
	element: Locator;
	name: string;
	testInfo: TestInfo;
	// The CDN data that the element shows, the baseline of a real campaign belongs to it.
	content: unknown;
};

// A real campaign (live or staging) has a baseline for every approved content, named by the content fingerprint.
// So the look before, during and after a campaign can all be approved ahead, and the nightly run picks the one that matches the CDN.
// Content without an approved baseline fails until a person checks the attached screenshot and approves it with --update-snapshots.
// Offline scenarios (no-promotion and active-campaign) are asserted via DOM checks, not visual snapshots.
export const checkCampaignLook = async ( { scenario, element, name, testInfo, content }: CampaignLook ): Promise<void> => {
	if ( NO_PROMOTION_SCENARIO === scenario || ACTIVE_CAMPAIGN_SCENARIO === scenario ) {
		return;
	}

	const baseline = `${ CAMPAIGN_BASELINE_PREFIX }-${ name }-${ getContentFingerprint( content ) }.png`;
	await waitForImages( element );
	await testInfo.attach( `${ scenario }-${ baseline }`, { body: await element.screenshot(), contentType: 'image/png' } );

	const isApproving = APPROVING_UPDATE_MODES.includes( testInfo.config.updateSnapshots );

	if ( ! isApproving && ! existsSync( testInfo.snapshotPath( baseline, { kind: 'screenshot' } ) ) ) {
		expect.soft( baseline, `The ${ scenario } CDN content of ${ name } is not approved. Check the attached ${ scenario }-${ baseline } screenshot, then approve it with Update Playwright Snapshots: test_grep="live @promotions" and the same cdn_source.` ).toBe( 'approved' );
		return;
	}

	await expect.soft( element ).toHaveScreenshot( baseline );
};

export const readEditorPromotion = ( scenario: string, name: EditorPromotionName ): EditorPromotion =>
	readFixture<EditorPromotion>( scenario, getEditorPromotionPath( name ), name ) ?? {};

const PRO_PLUGIN = 'elementor-pro/elementor-pro.php';

const isProCondition = ( condition: NotificationCondition ): boolean =>
	'plugin' === condition.type && PRO_PLUGIN === condition.plugin;

const isProConditionMet = ( condition: NotificationCondition, hasPro: boolean ): boolean =>
	'!=' === condition.operator ? ! hasPro : hasPro;

const hasOnlyProConditions = ( notification: Notification ): boolean =>
	( notification.conditions ?? [] ).every( ( group ) => group.every( isProCondition ) );

const isNotificationShown = ( notification: Notification, hasPro: boolean ): boolean =>
	! notification.conditions?.length ||
	notification.conditions.some( ( group ) => group.every( ( condition ) => isProConditionMet( condition, hasPro ) ) );

const isImageOnly = ( notification: Notification ): boolean => ! notification.title && ! notification.description;

export const readNotifications = ( scenario: string ): Notification[] =>
	readFixture<Notification[]>( scenario, NOTIFICATIONS_PATH, 'notifications' ) ?? [];

export const readFirstFullNotification = ( scenario: string, hasPro: boolean ): Notification | undefined => {
	const notifications = readNotifications( scenario );
	const mayBeShown = notifications.filter( ( notification ) => ! hasOnlyProConditions( notification ) || isNotificationShown( notification, hasPro ) );
	const hasFeatured = mayBeShown.some( ( notification ) => notification.featured );

	return mayBeShown.find( ( notification ) =>
		hasOnlyProConditions( notification ) &&
		! isImageOnly( notification ) &&
		( ! hasFeatured || notification.featured ),
	);
};

export const readSidebarPromotion = ( scenario: string, license: string ): SidebarPromotionVariant | undefined => {
	const homeScreen = readFixture<{ sidebar_promotion_variants?: SidebarPromotionVariant[] }>( scenario, HOME_SCREEN_PATH, 'home-screen' );

	return homeScreen?.sidebar_promotion_variants?.find( ( variant ) => 'true' === variant.is_enabled && variant.license.includes( license ) );
};

export const cdnFieldOrDefault = ( promotion: EditorPromotion, field: string, coreDefault: string ): string => {
	const value = promotion[ field ];

	return promotion.is_active && 'string' === typeof value && value ? value : coreDefault;
};

// Links of the cards that the Pro condition hides, except links that a shown card also uses.
export const readHiddenNotificationLinks = ( scenario: string, hasPro: boolean ): string[] => {
	const notifications = readNotifications( scenario );
	const isHidden = ( notification: Notification ) => hasOnlyProConditions( notification ) && ! isNotificationShown( notification, hasPro );
	const shownLinks = new Set( notifications.filter( ( notification ) => ! isHidden( notification ) ).map( ( notification ) => notification.ctaLink ) );

	return [ ...new Set( notifications
		.filter( isHidden )
		.map( ( notification ) => notification.ctaLink )
		.filter( ( link ): link is string => !! link && ! shownLinks.has( link ) ) ) ];
};

// Core merges every promotions entry into `elementor.config.v4Promotions`, so later entries win.
export const readV4Promotions = ( scenario: string ): Record<string, V4Promotion> =>
	Object.assign( {}, ...( readFixture<Record<string, V4Promotion>[]>( scenario, V4_PROMOTIONS_PATH, 'promotions' ) ?? [] ) );

export const readUpsellImage = ( scenario: string, id: string ): string | undefined =>
	readFixture<UpsellAsset[]>( scenario, UPSELL_PATH, 'free-to-pro-upsell' )?.find( ( asset ) => id === asset.id )?.imageSrc;
