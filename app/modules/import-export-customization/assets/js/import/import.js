import ImportContextProvider from './context/import-context';

import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import ImportKit from './pages/import-kit';
import ImportComplete from './pages/import-complete';

export default function Import() {
	return (
		<ImportContextProvider>
			<LocationProvider history={ router.appHistory }>
				<Router>
					<ImportKit path="/" default />
					<ImportComplete path="/complete" />
				</Router>
			</LocationProvider>
		</ImportContextProvider>
	);
}
