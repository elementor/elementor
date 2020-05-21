import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Module as SiteEditor } from '@elementor/site-editor';

new SiteEditor();

ReactDOM.render(
	// TODO: Remove Strict mode.
	<React.StrictMode>
		<App />
	</React.StrictMode>,
  document.getElementById( 'elementor-app' )
);
