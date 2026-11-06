import {
	CONVERSION_BANNER_CDN_OPTION,
	PROMOTION_CDN_INACTIVE_FIXTURE,
	SIDE_MENU_CDN_OPTION,
	STICKY_PANEL_CDN_OPTION,
	STICKY_PANEL_FIXTURE,
	THEME_BUILDER_CDN_OPTION,
} from './constants';
import { resetConversionBannerTriggerState } from './conversion-banner-test-helpers';
import { clearPromotionCdnCache, seedPromotionCdnCache } from './seed-promotion-cache';

export const seedStablePromotionCdnForScreenshotTests = async (): Promise<void> => {
	await resetConversionBannerTriggerState();
	await seedPromotionCdnCache( STICKY_PANEL_CDN_OPTION, STICKY_PANEL_FIXTURE );
	await seedPromotionCdnCache( SIDE_MENU_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
	await seedPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
	await seedPromotionCdnCache( THEME_BUILDER_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
};

export const seedInactivePromotionCdnForEditorChrome = async (): Promise<void> => {
	await seedPromotionCdnCache( STICKY_PANEL_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
	await seedPromotionCdnCache( SIDE_MENU_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
	await seedPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
	await seedPromotionCdnCache( THEME_BUILDER_CDN_OPTION, PROMOTION_CDN_INACTIVE_FIXTURE );
};

export const clearPromotionCdnSeeds = async (): Promise<void> => {
	await clearPromotionCdnCache( STICKY_PANEL_CDN_OPTION );
	await clearPromotionCdnCache( SIDE_MENU_CDN_OPTION );
	await clearPromotionCdnCache( CONVERSION_BANNER_CDN_OPTION );
	await clearPromotionCdnCache( THEME_BUILDER_CDN_OPTION );
};
