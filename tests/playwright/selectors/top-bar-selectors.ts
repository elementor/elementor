export type TopBarSelector = {
	attribute: string;
	attributeValue: string;
}

export default {
	elementorLogo: {
		attribute: 'value',
		attributeValue: 'selected',
	},
	elementsPanel: {
		attribute: 'value',
		attributeValue: 'Add Element',
	},
	documentSettings: {
		attribute: 'value',
		attributeValue: 'document-settings',
	},
	siteSettings: {
		attribute: 'value',
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
