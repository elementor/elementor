import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import AdminTopBar from './admin-top-bar';

const AppWrapper = elementorCommon.config.isDebug ? React.StrictMode : React.Fragment;
const adminTopBarElement = document.getElementById( 'e-admin-top-bar-root' );

render( (
	<AppWrapper>
		<AdminTopBar />
	</AppWrapper>
), adminTopBarElement );

// Support conditional rendering based on the React version.
// We use `createRoot` when available, but fallback to `ReactDOM.render` for older versions.
function render( app, domElement ) {
	let renderFn;

	try {
		const root = createRoot( domElement );

		renderFn = () => {
			root.render( app );
		};
	} catch ( e ) {
		renderFn = () => {
			// eslint-disable-next-line react/no-deprecated
			ReactDOM.render( app, domElement );
		};
	}

	renderFn();
}
