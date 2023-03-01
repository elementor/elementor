import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

export default class Handler extends elementorModules.frontend.handlers.Base {
	onInit() {
		super.onInit();
		let querySelector = document.querySelector('#wpadminbar');
		if (querySelector) querySelector.style.display = 'none';
		document.querySelectorAll( '.elementor-global-settings-widget' ).forEach(
			( element ) => {
				element.innerHTML = '';

				const config = {
					settings: JSON.parse( element.dataset.settings ),
				};

				ReactDOM.render(
					<App config={config}/>,
					element
				);
			}
		);
	}
}
