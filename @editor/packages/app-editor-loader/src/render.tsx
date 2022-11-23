import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

declare const window: {
	elementor: any,
};

const MAX_WAIT_TIME = 10000;
const WAIT_TIME_INTERVAL = 1000;
let waitTime = 0;

export const render = () => {
	if ( ! window.elementor ) {
		if ( waitTime < MAX_WAIT_TIME ) {
			// eslint-disable-next-line no-console
			console.log( 'waiting for elementor', waitTime );
			waitTime += WAIT_TIME_INTERVAL;
			setTimeout( render, WAIT_TIME_INTERVAL );
		}
		return;
	}

	const root = ReactDOM.createRoot( document.getElementById( 'root' ) as Element );
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
};
