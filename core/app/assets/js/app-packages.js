/**
 * Temporary solution for share components.
 * TODO.
 */

// Alphabetical order.
import Button from './molecules/button';
import NotFound from './pages/not-found';
import Page from './layout/page';
import Layout from './modules/site-editor/templates/layout';
import SiteParts from './modules/site-editor/organisms/site-parts';
import { Context as TemplateTypesContext } from './modules/site-editor/context/template-types';

window.elementorAppPackages = {
	appUi: {
		Button,
		NotFound,
		Page,
	},
	siteEditor: {
		Layout,
		SiteParts,
		TemplateTypesContext,
	},
};
