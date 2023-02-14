import App from './app';

import AppProvider from './app-context';
import Dashboard from '../../modules/dashboard/assets/js/module';

import * as ReactDOM from 'react-dom';

new Dashboard();

const AppWrapper = React.Fragment;

const appDashboard = document.getElementById( 'e-app-dashboard' );

if ( appDashboard ) {
	document.body.classList.add( 'folded' );

	ReactDOM.render(
		<AppWrapper>
			<AppProvider>
				<App />
			</AppProvider>
		</AppWrapper>,
		appDashboard,
	);
} else {
	document.body.classList.remove( 'folded' );
}

