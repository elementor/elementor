import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

window.__ = ( text, domain ) => {
	return text;
}

const render = () => {
	if ( ! window.elementor ) {
		console.log('wait for elementor');
		setTimeout(render, 100);
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
