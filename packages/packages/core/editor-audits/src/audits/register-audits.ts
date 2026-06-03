import { registerAudit } from '../registry';
import { type AuditDescriptor, type AuditEvaluator } from '../types';
import * as accessibilityPolicy from './accessibility-policy';
import * as cookiePolicy from './cookie-policy';
import * as deepNesting from './deep-nesting';
import * as defaultDesignSystem from './default-design-system';
import * as deprecatedWidgets from './deprecated-widgets';
import * as headingStructure from './heading-structure';
import * as hiddenElements from './hidden-elements';
import * as iconWidgetLinkMissingAriaLabel from './icon-widget-link-missing-aria-label';
import * as imageCarouselDefaultName from './image-carousel-default-name';
import * as imagesAltText from './images-alt-text';
import * as imagesTooLarge from './images-too-large';
import * as nestedBoxedContainers from './nested-boxed-containers';
import * as pageExcerpt from './page-excerpt';
import * as pageFeaturedImage from './page-featured-image';
import * as pageTitle from './page-title';
import * as preferGlobalColors from './prefer-global-colors';
import * as preferGlobalFonts from './prefer-global-fonts';
import * as privacyPolicy from './privacy-policy';
import * as sectionsAndColumns from './sections-and-columns';
import * as tooManyWidgets from './too-many-widgets';

const AUDITS_LIST: Array< { descriptor: AuditDescriptor; evaluator: AuditEvaluator } > = [
	pageTitle,
	pageExcerpt,
	pageFeaturedImage,

	privacyPolicy,
	accessibilityPolicy,
	cookiePolicy,

	hiddenElements,
	deprecatedWidgets,
	tooManyWidgets,
	sectionsAndColumns,
	deepNesting,
	nestedBoxedContainers,

	defaultDesignSystem,
	preferGlobalColors,
	preferGlobalFonts,

	headingStructure,
	imagesAltText,
	imagesTooLarge,

	imageCarouselDefaultName,
	iconWidgetLinkMissingAriaLabel,
];

export function registerAllAudits(): void {
	for ( const { descriptor, evaluator } of AUDITS_LIST ) {
		registerAudit( descriptor, evaluator );
	}
}
