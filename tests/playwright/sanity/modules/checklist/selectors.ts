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
	popup: '#e-checklist > div',
	toggleExpandButton: '#e-checklist > div header > div button:nth-child(2)',
	closeButton: '#e-checklist > div header > div button:nth-child(3)',
	checklistItemButton: '#e-checklist .MuiListItemButton-root',
	checklistItemContent: '#e-checklist .MuiCollapse-root',
	stepIcon: '.MuiListItemIcon-root',
	markAsButton: 'button:nth-child(1)',
	cta: 'button:nth-child(2)',
	progressBarWrapper: '#e-checklist header > div >> nth=1',
	progressBarPercentage: '#e-checklist header > div:nth-child(2) > div:nth-child(2)',
	infotipFirstTimeClosed: '.e-checklist-infotip-first-time-closed',
	infotipFirstTimeClosedButton: '.infotip-first-time-closed-button',
	allDone: '.e-checklist-done',
	gotItButton: '.e-checklist-done button',
};

export { controlIds, selectors };
