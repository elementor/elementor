const controlIds = {
	preferencePanel: {
		checklistSwitcher: 'show_launchpad_checklist',
	},
	topBar: {
		icon: '[aria-label="Checklist"]',
	},
};

const selectors = {
	topBarIcon: '[aria-label="Checklist"]',
	popup: '#e-checklist .e-checklist-popup',
	closeButton: '.e-checklist-close',
	checklistItemButton: '.e-checklist-item-button',
	checklistItemContent: '.e-checklist-item-content',
	markAsDone: '.mark-as-done',
	unmarkAsDone: '.mark-as-undone',
	cta: '.cta-button',
};

export { controlIds, selectors };
