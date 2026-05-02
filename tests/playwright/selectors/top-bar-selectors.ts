export type TopBarSelector = {
	attribute: string;
	attributeValue: string;
}

export default {
	navigator: {
		attribute: 'value',
		attributeValue: 'Structure',
	},
	elementorLogo: {
		attribute: 'value',
		attributeValue: 'selected',
	},
	elementsPanel: {
		attribute: 'aria-label',
		attributeValue: 'Add Element',
	},
	pageSettings: {
		attribute: 'aria-label',
		attributeValue: 'Page Settings',
	},
	siteSettings: {
		attribute: 'aria-label',
		attributeValue: 'Site Settings',
	},
	saveOptions: {
		attribute: 'aria-label',
		attributeValue: 'Save Options',
	},
	publish: {
		attribute: 'text',
		attributeValue: 'Publish',
	},
	checklistToggle: {
		attribute: 'aria-label',
		attributeValue: 'Checklist',
	},
};
