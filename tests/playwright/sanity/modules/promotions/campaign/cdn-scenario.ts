import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { type BrowserContext } from '@playwright/test';

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
		throw new Error( `CDN scenario "${ scenario }" is missing ${ missing.join( ', ' ) }. Run \`npm run test:playwright:fetch-cdn\` before starting WordPress.` );
	}
};

export const useCdnScenario = async ( context: BrowserContext, baseURL: string, scenario: string ): Promise<void> => {
	await context.addCookies( [ { name: SCENARIO_COOKIE, value: scenario, url: baseURL } ] );
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

export const readFirstFullNotification = ( scenario: string, hasPro: boolean ): Notification | undefined => {
	const notifications = readFixture<Notification[]>( scenario, NOTIFICATIONS_PATH, 'notifications' ) ?? [];
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
