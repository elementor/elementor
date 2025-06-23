/**
 * All the code in this directory is a temporary solution.
 * The code should be moved to the appropriate packages.
 */

import { init as initDocumentsIndicator } from './documents-indicator';
import { init as initDocumentsPreview } from './documents-preview';
import { init as initDocumentsSave } from './documents-save';
import { init as initElements } from './elements';
import { init as initFinder } from './finder';
import { init as initHelp } from './help';
import { init as initHistory } from './history';
import { init as initKeyboardShortcuts } from './keyboard-shortcuts';
import { init as initResponsive } from './responsive';
import { init as initSiteSettings } from './site-settings';
import { init as initStructure } from './structure';
import { init as initThemeBuilder } from './theme-builder';
import { init as initUserPreferences } from './user-preferences';
import { init as initWordpress } from './wordpress';

export function init() {
	initDocumentsIndicator();
	initDocumentsPreview();
	initDocumentsSave();
	initElements();
	initFinder();
	initHelp();
	initHistory();
	initKeyboardShortcuts();
	initResponsive();
	initSiteSettings();
	initStructure();
	initThemeBuilder();
	initUserPreferences();
	initWordpress();
}
