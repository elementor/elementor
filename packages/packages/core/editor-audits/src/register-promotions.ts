import { ElementorCookieIcon, PhotoIcon, ShieldHalfFilledIcon } from '@elementor/icons';
import { __, _n, sprintf } from '@wordpress/i18n';

import { type AuditRun } from './types';

export type PromotionIcon = typeof PhotoIcon;

export type PromotionConfig = {
	auditId: string;
	icon: PromotionIcon;
	ctaLabel: string;
	formatSubtitle: ( run: AuditRun ) => string | null;
	getCtaUrl: ( run: AuditRun ) => string | undefined;
};

export const PROMOTIONS: PromotionConfig[] = [
	{
		auditId: 'audits/images-alt-text',
		icon: PhotoIcon,
		ctaLabel: __( 'Fix with Ally', 'elementor' ),
		formatSubtitle: ( run ) => {
			if ( run.result.status !== 'fail' ) {
				return null;
			}

			const count = run.result.metadata?.missingAltImageCount ?? 0;

			if ( count === 0 ) {
				return null;
			}

			return sprintf(
				/* translators: %d: number of images missing alt text. */
				_n( '%d image', '%d images', count, 'elementor' ),
				count
			);
		},
		getCtaUrl: ( run ) => ( run.result.status === 'fail' ? run.result.violations[ 0 ]?.externalUrl : undefined ),
	},
	{
		auditId: 'audits/cookie-policy',
		icon: ElementorCookieIcon,
		ctaLabel: __( 'Fix with Cookiez', 'elementor' ),
		formatSubtitle: ( run ) =>
			run.result.status === 'fail' ? __( 'Generate cookie policy', 'elementor' ) : null,
		getCtaUrl: ( run ) => ( run.result.status === 'fail' ? run.result.violations[ 0 ]?.externalUrl : undefined ),
	},
	{
		auditId: 'audits/images-too-large',
		icon: ShieldHalfFilledIcon,
		ctaLabel: __( 'Optimize all', 'elementor' ),
		formatSubtitle: ( run ) => {
			if ( run.result.status !== 'fail' ) {
				return null;
			}

			const count = run.result.metadata?.oversizedImageCount ?? 0;

			if ( count === 0 ) {
				return null;
			}

			return sprintf(
				/* translators: %d: number of oversized images. */
				_n( '%d image', '%d images', count, 'elementor' ),
				count
			);
		},
		getCtaUrl: ( run ) => ( run.result.status === 'fail' ? run.result.violations[ 0 ]?.externalUrl : undefined ),
	},
];
