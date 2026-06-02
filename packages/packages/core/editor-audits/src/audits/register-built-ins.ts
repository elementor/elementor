import { registerAudit } from '../registry';
import { type AuditDescriptor, type AuditEvaluator } from '../types';
import * as defaultDesignSystem from './default-design-system';
import * as headingStructure from './heading-structure';
import * as iconWidgetLinkMissingAriaLabel from './icon-widget-link-missing-aria-label';
import * as imageCarouselDefaultName from './image-carousel-default-name';
import * as imagesMissingAlt from './images-missing-alt';
import * as imagesTooLarge from './images-too-large';
import * as missingAccessibilityPolicy from './missing-accessibility-policy';
import * as missingCookiePolicy from './missing-cookie-policy';
import * as missingExcerpt from './missing-excerpt';
import * as missingFeaturedImage from './missing-featured-image';
import * as missingPageTitle from './missing-page-title';
import * as missingPrivacyPolicy from './missing-privacy-policy';
import * as nestedBoxedContainers from './nested-boxed-containers';
import * as preferGlobalColors from './prefer-global-colors';
import * as usesSectionsOrColumns from './uses-sections-or-columns';

const AUDITS_LIST: Array< { descriptor: AuditDescriptor; evaluator: AuditEvaluator } > = [
	missingPageTitle,
	missingExcerpt,
	missingFeaturedImage,
	usesSectionsOrColumns,
	defaultDesignSystem,
	headingStructure,
	imagesMissingAlt,
	imagesTooLarge,
	preferGlobalColors,
	imageCarouselDefaultName,
	nestedBoxedContainers,
	iconWidgetLinkMissingAriaLabel,
	missingPrivacyPolicy,
	missingAccessibilityPolicy,
	missingCookiePolicy,
];

export function registerAllAudits(): void {
	for ( const { descriptor, evaluator } of AUDITS_LIST ) {
		registerAudit( descriptor, evaluator );
	}
}
