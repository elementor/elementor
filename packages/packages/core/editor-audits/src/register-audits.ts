import * as accessibilityPolicy from './audits/accessibility-policy';
import * as cookiePolicy from './audits/cookie-policy';
import * as deepNesting from './audits/deep-nesting';
import * as defaultDesignSystem from './audits/default-design-system';
import * as deprecatedWidgets from './audits/deprecated-widgets';
import * as headingStructure from './audits/heading-structure';
import * as hiddenElements from './audits/hidden-elements';
import * as imagesAltText from './audits/images-alt-text';
import * as imagesTooLarge from './audits/images-too-large';
import * as nestedBoxedContainers from './audits/nested-boxed-containers';
import * as pageExcerpt from './audits/page-excerpt';
import * as pageFeaturedImage from './audits/page-featured-image';
import * as pageTitle from './audits/page-title';
import * as preferGlobalColors from './audits/prefer-global-colors';
import * as preferGlobalFonts from './audits/prefer-global-fonts';
import * as privacyPolicy from './audits/privacy-policy';
import * as sectionsAndColumns from './audits/sections-and-columns';
import * as siteIdentity from './audits/site-identity';
import * as tooManyWidgets from './audits/too-many-widgets';
import { registerAudit } from './registry';
import { type Audit } from './types';

const AUDITS: Audit[] = [
	pageTitle.audit,
	pageExcerpt.audit,
	pageFeaturedImage.audit,

	privacyPolicy.audit,
	accessibilityPolicy.audit,
	cookiePolicy.audit,

	hiddenElements.audit,
	deprecatedWidgets.audit,
	tooManyWidgets.audit,
	sectionsAndColumns.audit,
	deepNesting.audit,
	nestedBoxedContainers.audit,

	defaultDesignSystem.audit,
	siteIdentity.audit,
	preferGlobalColors.audit,
	preferGlobalFonts.audit,

	headingStructure.audit,
	imagesAltText.audit,
	imagesTooLarge.audit,
];

export function registerAllAudits(): void {
	for ( const audit of AUDITS ) {
		registerAudit( audit );
	}
}
