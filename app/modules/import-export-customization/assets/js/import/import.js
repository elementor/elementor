import ImportContextProvider from './context/import-context';

import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import ImportKit from './pages/import-kit';
import ImportComplete from './pages/import-complete';
import ImportCustomization from './pages/import-customization';
import ImportProcess from './pages/import-process';

export default function Import() {
	return (
		<ImportContextProvider>
			<LocationProvider history={ router.appHistory }>
				<Router>
					<ImportKit path="/" default />
					<ImportCustomization path="/content" />
					<ImportProcess path="/process" />
					<ImportComplete path="/complete" />
				</Router>
			</LocationProvider>
		</ImportContextProvider>
	);
}
