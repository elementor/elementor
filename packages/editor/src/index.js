import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

window.__ = ( text, domain ) => {
	return text;
}

const MAX_WAIT_TIME = 10000;
const WAIT_TIME_INTERVAL = 1000;
let waitTime = 0;
const render = () => {
	if ( ! window.elementor ) {
		if ( waitTime < MAX_WAIT_TIME ) {
			console.log('wait for elementor', waitTime);
			waitTime += WAIT_TIME_INTERVAL;
			setTimeout(render, WAIT_TIME_INTERVAL);
		}
		return;
	}

	const root = ReactDOM.createRoot(document.getElementById('root'));
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}

render();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
