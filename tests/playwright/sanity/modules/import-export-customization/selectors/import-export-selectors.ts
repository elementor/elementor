export const ImportExportSelectors = {
	toolsMenu: '[data-testid="tools-menu"]',
	websiteTemplatesTab: '#elementor-settings-tab-import-export-kit',
	exportButton: '#elementor-import-export__export',
	importNavigationButton: '#elementor-import-export__import',
	tabContent: '#tab-import-export-kit',

	exportCustomizationPage: '/wp-admin/admin.php?page=elementor-app&ver=3.33.0#/export',

	kitNameInput: 'input[placeholder="Type name here..."]',
	kitDescriptionInput: 'textarea[placeholder="Type description here..."]',

	contentSection: '[data-testid="KitPartsSelectionRow-content"]',
	templatesSection: '[data-testid="KitPartsSelectionRow-templates"]',
	settingsSection: '[data-testid="KitPartsSelectionRow-settings"]',
	pluginsSection: '[data-testid="KitPartsSelectionRow-plugins"]',

	contentCheckbox: '[data-testid="KitPartsSelectionRow-content"] input[type="checkbox"]',
	templatesCheckbox: '[data-testid="KitPartsSelectionRow-templates"] input[type="checkbox"]',
	settingsCheckbox: '[data-testid="KitPartsSelectionRow-settings"] input[type="checkbox"]',
	pluginsCheckbox: '[data-testid="KitPartsSelectionRow-plugins"] input[type="checkbox"]',

	contentEditButton: '[data-testid="KitPartsSelectionRow-content"] button:has-text("Edit")',
	templatesUpgradeButton: '[data-testid="KitPartsSelectionRow-templates"] button:has-text("Upgrade")',
	settingsEditButton: '[data-testid="KitPartsSelectionRow-settings"] button:has-text("Edit")',
	pluginsEditButton: '[data-testid="KitPartsSelectionRow-plugins"] button:has-text("Edit")',

	themeSwitch: '[data-testid="theme-switch"]',
	postCheckbox: 'input[type="checkbox"]:near(label:has-text("Post"))',
	helloDollyCheckbox: 'input[type="checkbox"]:near(label:has-text("Hello Dolly"))',
	wordPressImporterCheckbox: 'input[type="checkbox"]:near(label:has-text("WordPress Importer"))',

	saveChangesButton: 'button:has-text("Save changes")',
	exportAsZipButton: 'button:has-text("Export as .zip")',
	importActionButton: 'button:has-text("Import")',

	summaryContentSection: '[data-testid="summary_section_content"]',
	summaryTemplatesSection: '[data-testid="summary_section_templates"]',
	summarySettingsSection: '[data-testid="summary_section_settings"]',
	summaryPluginsSection: '[data-testid="summary_section_plugins"]',

	doneButton: '[data-testid="done-button"]',
	learnMoreLink: 'text=Build sites faster with Website Templates. Show me how',
} as const;
