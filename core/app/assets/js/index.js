import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Module as SiteEditor } from '@elementor/site-editor';
import ImportExport from '../../modules/import-export/assts/js/module';

if ( location.href.includes( 'mode=iframe' ) ) {
	window.elementorCommon = window.top.elementorCommon;
	window.$e = window.top.$e;
}

new SiteEditor();
new ImportExport();

ReactDOM.render(
	// TODO: Remove Strict mode.
	<App />,
  document.getElementById( 'elementor-app' )
);
