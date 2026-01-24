import { Page } from '@playwright/test';

export const INLINE_EDITING_SELECTORS = {
	triggerEvent: 'click' as keyof Page,
	e_paragraph: 'e-paragraph',
	headingBase: '.e-heading-base',
	supportedAtoms: {
		paragraph: 'e-paragraph',
		heading: 'e-heading',
	},
	atomsBaseClass: {
		paragraph: '.e-paragraph-base',
		heading: '.e-heading-base',
	},
	attributes: {
		bold: 'bold',
		underline: 'underline',
		strikethrough: 'strike',
		superscript: 'superscript',
		subscript: 'subscript',
		link: 'link',
	},
	preMadeContent: {
		paragraph: {
			paragraphPrefix: 'This is a paragraph with ',
			paragraphSuffix: ' text.',
			secondLine: 'Second line here.',
			textBetween: ' text and ',
		},
	},
	panel: {
		contentSection: 'Content section content',
		inlineEditor: '.tiptap',
		contentSectionLabel: 'Content',
	},
	canvas: {
		inlineEditor: '[contenteditable="true"][class*="ProseMirror"]',
	},
};
