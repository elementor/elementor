import { type ComponentInstanceHeaderProps } from '@elementor/editor-components';
import { type ControlHeaderProps } from '@elementor/editor-controls';
import { type CustomCssHeaderProps, type StyleTabHeaderProps } from '@elementor/editor-editing-panel';
import { type InteractionsHeaderProps } from '@elementor/editor-interactions';
import { type VariableFormHeaderProps } from '@elementor/editor-variables';

const BACKGROUND_PROP_KEY = 'background';

type ControlHeaderPromptParams = Pick< ControlHeaderProps, 'controlType' | 'bind' | 'path' > & {
	elementId: string;
};

type SiteContentActiveDocumentPromptParams = {
	postId: number;
	postType: string;
	title: string;
};

type AngiePromptBuilders = {
	backgroundImage: ( elementId: string ) => string;
	classManager: () => string;
	classSelector: ( elementId: string, classLabel: string ) => string;
	componentInstance: ( params: ComponentInstanceHeaderProps ) => string;
	componentsTab: () => string;
	controlHeader: ( params: ControlHeaderPromptParams ) => string | null;
	customCss: ( params: CustomCssHeaderProps ) => string;
	defaultStylesManager: () => string;
	image: ( elementId: string ) => string;
	interactions: ( params: InteractionsHeaderProps ) => string;
	namedImage: ( elementId: string, bind: string ) => string;
	siteContentActiveDocument: ( params: SiteContentActiveDocumentPromptParams ) => string;
	styleTab: ( params: StyleTabHeaderProps ) => string;
	text: ( elementId: string ) => string;
	variableForm: ( params: VariableFormHeaderProps ) => string;
	variablesManager: () => string;
};

export const ANGIE_PROMPTS: AngiePromptBuilders = {
	backgroundImage: ( elementId: string ) => `At element ${ elementId }, background image, I want: `,
	classManager: () => 'In the design system global classes, I want: ',
	classSelector: ( elementId: string, classLabel: string ) =>
		`At element ${ elementId }, class "${ classLabel }", I want: `,
	componentInstance: ( { componentId, elementId }: ComponentInstanceHeaderProps ) =>
		`At component ${ componentId } (instance ${ elementId }) I want: `,
	componentsTab: () => 'In components, I want: ',
	controlHeader: ( { elementId, controlType, bind, path }: ControlHeaderPromptParams ) => {
		if ( 'inline-editing' === controlType ) {
			return ANGIE_PROMPTS.text( elementId );
		}

		if ( 'image' === controlType && path.includes( BACKGROUND_PROP_KEY ) ) {
			return ANGIE_PROMPTS.backgroundImage( elementId );
		}

		if ( 'image' === controlType ) {
			if ( 'image' === bind ) {
				return ANGIE_PROMPTS.image( elementId );
			}

			return ANGIE_PROMPTS.namedImage( elementId, bind );
		}

		return null;
	},
	customCss: ( { elementId }: CustomCssHeaderProps ) => `At element ${ elementId }, custom CSS, I want: `,
	defaultStylesManager: () => 'In the design system default styles, I want: ',
	image: ( elementId: string ) => `At element ${ elementId }, image, I want: `,
	interactions: ( { elementId }: InteractionsHeaderProps ) => `At element ${ elementId }, interactions, I want: `,
	namedImage: ( elementId: string, bind: string ) => `At element ${ elementId }, image "${ bind }", I want: `,
	siteContentActiveDocument: ( { postId, postType, title }: SiteContentActiveDocumentPromptParams ) =>
		`For ${ postType } "${ title }" (document id ${ postId }), I want: `,
	styleTab: ( { elementId }: StyleTabHeaderProps ) => `At element ${ elementId }, styles, I want: `,
	text: ( elementId: string ) => `At element ${ elementId } I want: `,
	variableForm: ( { variableType, label }: VariableFormHeaderProps ) => {
		if ( label ) {
			return `For ${ variableType } variable "${ label }" I want: `;
		}

		return `For new ${ variableType } variable I want: `;
	},
	variablesManager: () => 'In the design system variables, I want: ',
};

export const buildAngieSiteLogoPrompt = (): string =>
	[
		'Update the Site Identity site logo on the active kit. Site Settings (kit) must be open as the current document before any get or set.',
		'Call v3-kit-site-identity (not update-elementor-kit-settings-colors-and-fonts) with action "get" to read the current site name, description, logo, and favicon.',
		'Use the image agent to create or pick an appropriate site logo. Do not use an MCP tool for image generation.',
		'When you have a public HTTPS image URL, call elementor/upload-media to import it into the WordPress Media Library (admin only).',
		'Call v3-kit-site-identity with action "set" and patch { site_logo: { id, url } } using the attachment id and URL from the upload step.',
		'Do not invent other write paths.',
	].join( '\n\n' );

export const buildAngieV3TextPrompt = ( {
	elementId,
	controlName,
	controlType,
	currentValue,
}: {
	elementId?: string;
	controlName?: string;
	controlType?: string;
	currentValue?: unknown;
} ): string => {
	const hasExistingText = 'string' === typeof currentValue && Boolean( currentValue.trim() );
	const actionHint = hasExistingText
		? 'Write improved text, edit the current text, change its tone, or translate it.'
		: 'Write new text for this control. The user may also ask to change tone or translate.';

	return [
		`Update the V3 ${ controlType } control "${ controlName }" on element "${ elementId }".`,
		actionHint,
		hasExistingText ? 'The control has existing text.' : 'The control is currently empty.',
		'When ready, use the v3-text-control tool to read or set this control value. Do not invent other write paths.',
	].join( '\n\n' );
};

export const buildAngieV3AnimationPrompt = ( {
	elementId,
	controlName,
	animationType,
	motionSettingsSummary,
}: {
	elementId?: string;
	controlName?: string;
	animationType?: string;
	motionSettingsSummary?: string;
} ): string => {
	const isHover = 'hover' === animationType;
	const scopeLabel = isHover ? 'hover' : 'entrance';

	return [
		`Update ${ scopeLabel } motion on V3 element "${ elementId }" (control "${ controlName }").`,
		`Animation scope: ${ scopeLabel }.`,
		motionSettingsSummary
			? `Current motion settings:\n${ motionSettingsSummary }`
			: 'Current motion settings are empty or unavailable.',
		'When ready, use the v3-motion-effects tool with action "get" to inspect settings, then "set" to apply changes (one undo step). Do not invent other write paths.',
	].join( '\n\n' );
};

export const buildAngieV3CodePrompt = ( {
	elementId,
	controlName,
	controlType,
	language,
	currentValue,
}: {
	elementId?: string;
	controlName?: string;
	controlType?: string;
	language?: string;
	currentValue?: unknown;
} ): string => {
	const hasExistingCode = 'string' === typeof currentValue && Boolean( currentValue.trim() );
	const languageLabel = language || 'code';
	const actionHint = hasExistingCode
		? `Write improved ${ languageLabel }, edit the current ${ languageLabel }, or generate a replacement.`
		: `Write new ${ languageLabel } for this control.`;

	return [
		`Update the V3 ${ controlType || 'code' } control "${ controlName }" on element "${ elementId }".`,
		language ? `Language: ${ language }.` : 'Language is unspecified.',
		actionHint,
		hasExistingCode
			? 'The control has existing code. Call v3-code-control with action "get" before editing, then action "set" when ready.'
			: 'The control is currently empty.',
		'When ready, use the v3-code-control tool to read or set this control value. Do not invent other write paths.',
	].join( '\n\n' );
};

export type AngieV3LayoutPromptMode = 'new-layout' | 'container-variation' | 'library-variation';

export type AngieV3LayoutPromptContext = {
	mode: AngieV3LayoutPromptMode;
	documentType?: string;
	at?: number | null;
	targetContainerId?: string;
	parentContainerId?: string;
	replaceElementId?: string;
	targetElementTitle?: string;
	libraryTemplateId?: string | number;
	libraryTemplateTitle?: string;
};

export const buildAngieV3LayoutPrompt = ( {
	mode,
	documentType,
	at,
	targetContainerId,
	parentContainerId,
	replaceElementId,
	targetElementTitle,
	libraryTemplateId,
	libraryTemplateTitle,
}: AngieV3LayoutPromptContext ): string => {
	const positionHint =
		'number' === typeof at
			? `Canvas position index: ${ at }.`
			: 'Use the canvas position where the button was clicked.';

	const parentHint = parentContainerId ? `Parent container id: ${ parentContainerId }.` : '';
	const replaceHint = replaceElementId
		? `Replace element id: ${ replaceElementId } (pass this as the layout tool replace/target id).`
		: '';

	switch ( mode ) {
		case 'container-variation':
			return [
				`Help with a layout variation for container "${ targetContainerId }"${
					targetElementTitle ? ` (${ targetElementTitle })` : ''
				}.`,
				`Document type: ${
					documentType || 'unknown'
				}. ${ positionHint } ${ parentHint } ${ replaceHint }`.trim(),
			].join( '\n\n' );
		case 'library-variation':
			return [
				`Help with a variation from template library item ${ libraryTemplateId ?? 'unknown' }${
					libraryTemplateTitle ? ` (${ libraryTemplateTitle })` : ''
				}.`,
				`Document type: ${ documentType || 'unknown' }. ${ positionHint }`,
			].join( '\n\n' );
		case 'new-layout':
		default:
			return [ `Help build a layout for document type "${ documentType || 'unknown' }".`, positionHint ].join(
				'\n\n'
			);
	}
};
