import { getWidgetsCache } from '@elementor/editor-elements';

export const generateAvailableTags = (): { tag: string; description: string }[] => {
	const cache = getWidgetsCache();
	const customTags = Object.entries( cache )
		.filter( ( [ , widgetData ] ) => !! widgetData.atomic_controls )
		.map( ( [ widgetType, widgetData ] ) => ( {
			tag: `${ widgetType }`,
			description: widgetData.elType || `A ${ widgetType } element`,
		} ) );
	return customTags;
	return [
		{
			tag: 'e-flexbox',
			description: 'A flexible container that arranges its children in a row or column layout',
		},
		{
			tag: 'e-button',
			description: 'A clickable button element',
		},
		{
			tag: 'e-heading',
			description: 'A heading element for titles and subtitles',
		},
		{
			tag: 'e-paragraph',
			description: 'A text element for paragraphs and general text content',
		},
		{
			tag: 'e-divider',
			description: 'A horizontal or vertical line used to separate content',
		},
		{
			tag: 'e-image',
			description: 'An element to display images',
		},
		{
			tag: 'e-youtube',
			description: 'An element to embed YouTube videos',
		},
	];
};
