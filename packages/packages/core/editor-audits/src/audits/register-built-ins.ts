import { registerAudit } from '../registry';
import {
	descriptor as missingAccessibilityPolicyDescriptor,
	evaluator as missingAccessibilityPolicyEvaluator,
} from './missing-accessibility-policy';
import {
	descriptor as missingCookiePolicyDescriptor,
	evaluator as missingCookiePolicyEvaluator,
} from './missing-cookie-policy';
import {
	descriptor as defaultDesignSystemDescriptor,
	evaluator as defaultDesignSystemEvaluator,
} from './default-design-system';
import { descriptor as headingStructureDescriptor, evaluator as headingStructureEvaluator } from './heading-structure';
import {
	descriptor as iconLinkDescriptor,
	evaluator as iconLinkEvaluator,
} from './icon-widget-link-missing-aria-label';
import {
	descriptor as carouselNameDescriptor,
	evaluator as carouselNameEvaluator,
} from './image-carousel-default-name';
import { descriptor as imagesMissingAltDescriptor, evaluator as imagesMissingAltEvaluator } from './images-missing-alt';
import { descriptor as imagesTooLargeDescriptor, evaluator as imagesTooLargeEvaluator } from './images-too-large';
import { descriptor as missingExcerptDescriptor, evaluator as missingExcerptEvaluator } from './missing-excerpt';
import {
	descriptor as missingFeaturedImageDescriptor,
	evaluator as missingFeaturedImageEvaluator,
} from './missing-featured-image';
import { descriptor as missingPageTitleDescriptor, evaluator as missingPageTitleEvaluator } from './missing-page-title';
import {
	descriptor as missingPrivacyPolicyDescriptor,
	evaluator as missingPrivacyPolicyEvaluator,
} from './missing-privacy-policy';
import { descriptor as nestedBoxedDescriptor, evaluator as nestedBoxedEvaluator } from './nested-boxed-containers';
import {
	descriptor as preferGlobalColorsDescriptor,
	evaluator as preferGlobalColorsEvaluator,
} from './prefer-global-colors';
import { descriptor as usesSectionsDescriptor, evaluator as usesSectionsEvaluator } from './uses-sections-or-columns';

export function registerBuiltInAudits(): void {
	registerAudit( missingPageTitleDescriptor, missingPageTitleEvaluator );
	registerAudit( missingExcerptDescriptor, missingExcerptEvaluator );
	registerAudit( missingFeaturedImageDescriptor, missingFeaturedImageEvaluator );
	registerAudit( usesSectionsDescriptor, usesSectionsEvaluator );
	registerAudit( defaultDesignSystemDescriptor, defaultDesignSystemEvaluator );
	registerAudit( headingStructureDescriptor, headingStructureEvaluator );
	registerAudit( imagesMissingAltDescriptor, imagesMissingAltEvaluator );
	registerAudit( imagesTooLargeDescriptor, imagesTooLargeEvaluator );
	registerAudit( preferGlobalColorsDescriptor, preferGlobalColorsEvaluator );
	registerAudit( carouselNameDescriptor, carouselNameEvaluator );
	registerAudit( nestedBoxedDescriptor, nestedBoxedEvaluator );
	registerAudit( iconLinkDescriptor, iconLinkEvaluator );
	registerAudit( missingPrivacyPolicyDescriptor, missingPrivacyPolicyEvaluator );
	registerAudit( missingAccessibilityPolicyDescriptor, missingAccessibilityPolicyEvaluator );
	registerAudit( missingCookiePolicyDescriptor, missingCookiePolicyEvaluator );
}
