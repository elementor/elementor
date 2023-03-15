import SharedContextProvider from './context/shared-context/shared-context-provider';
import ImportContextProvider from './context/import-context/import-context-provider';

import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import ImportKit from './pages/import/import-kit/import-kit';
import ImportContent from './pages/import/import-content/import-content';
import ImportResolver from './pages/import/import-resolver/import-resolver';
import ImportPluginsActivation from './pages/import/import-plugins-activation/import-plugins-activation';
import ImportProcess from './pages/import/import-process/import-process';
import ImportComplete from './pages/import/import-complete/import-complete';
import ImportPlugins from './pages/import/import-plugins/import-plugins';

export default function Import() {
	return (
		<SharedContextProvider>
			<ImportContextProvider>
				<LocationProvider history={ router.appHistory }>
					<Router>
						<ImportComplete path="complete" />
						<ImportProcess path="process" />
						<ImportResolver path="resolver" />
						<ImportContent path="content" />
						<ImportPlugins path="plugins" />
						<ImportPluginsActivation path="plugins-activation" />
						<ImportKit default />
					</Router>
				</LocationProvider>
			</ImportContextProvider>
		</SharedContextProvider>
	);
}
