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
	closeButton: '#e-checklist > div header button',
	checklistItemButton: '#e-checklist .MuiListItemButton-root',
	checklistItemContent: '#e-checklist .MuiCollapse-root',
	stepIcon: '.MuiListItemIcon-root',
	markAsButton: 'button:nth-child(1)',
	cta: 'button:nth-child(2)',
	progressBarWrapper: '#e-checklist header > div >> nth=1',
	progressBarPercentage: '#e-checklist header > div:nth-child(2) > div:nth-child(2)',
	infotipFirstTimeClosed: '.e-checklist-infotip-first-time-closed',
	infotipFirstTimeClosedButton: '.infotip-first-time-closed-button',
};

export { controlIds, selectors };
