import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

//
/**
 * Support conditional rendering of a React App to the DOM, based on the React version.
 * We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
 *
 * @param {React.ReactNode} app - The app to render.
 * @param {HTMLElement} domElement - The DOM element to render the app into.
 *
 * @return {Root} The root object, if it was created. `null` otherwise.
 */
function render( app, domElement ) {
	let root = null;
	let renderFn;

	try {
		root = createRoot( domElement );

		renderFn = () => {
			return root.render( app );
		};
	} catch ( e ) {
		renderFn = () => {
			// eslint-disable-next-line react/no-deprecated
			return ReactDOM.render( app, domElement );
		};
	}

	const render = renderFn();

	return {
		root,
		render,
	};
}

function unmount( root, domElement ) {
	try {
		root.unmount();
	} catch ( e ) {
		// eslint-disable-next-line react/no-deprecated
		ReactDOM.unmountComponentAtNode( domElement );
	}
}

export default {
	render,
	unmount,
}
