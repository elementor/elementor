/**
 * All the code in this directory is a temporary solution.
 * The code should be moved to the appropriate packages.
 */

import { init as initConnect } from './connect';
import { init as initDocumentsPreview } from './documents-preview';
import { init as initDocumentsSave } from './documents-save';
import { init as initDocumentsSettings } from './documents-settings';
import { init as initElements } from './elements';
import { init as initFeedback } from './feedback';
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
	initDocumentsPreview();
	initDocumentsSave();
	initDocumentsSettings();
	initElements();
	initFinder();
	initHelp();
	initHistory();
	initKeyboardShortcuts();
	initResponsive();
	initSiteSettings();
	initFeedback();
	initStructure();
	initThemeBuilder();
	initUserPreferences();
	initWordpress();
	initConnect();
}
