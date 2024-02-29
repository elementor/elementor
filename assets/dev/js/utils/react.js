import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

/**
 * Support conditional rendering of a React App to the DOM, based on the React version.
 * We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
 *
 * @param { React.ReactElement } app        The app to render.
 * @param { HTMLElement }        domElement The DOM element to render the app into.
 *
 * @return {{ unmount: () => void }} The unmount function.
 */
function render( app, domElement ) {
	let unmountFunction;

	try {
		const root = createRoot( domElement );
		root.render( app );

		unmountFunction = () => {
			root.unmount();
		};
	} catch ( e ) {
		// eslint-disable-next-line react/no-deprecated
		ReactDOM.render( app, domElement );

		unmountFunction = () => {
			// eslint-disable-next-line react/no-deprecated
			ReactDOM.unmountComponentAtNode( domElement );
		};
	}

	return { unmount: unmountFunction };
}

export default {
	render,
};
