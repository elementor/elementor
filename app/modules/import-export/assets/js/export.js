import SharedContextProvider from './context/shared-context/shared-context-provider';
import ExportContextProvider from './context/export-context/export-context-provider';

import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import ExportKit from './pages/export/export-kit/export-kit';
import ExportComplete from './pages/export/export-complete/export-complete';
import ExportPlugins from './pages/export/export-plugins/export-plugins';
import ExportProcess from './pages/export/export-process/export-process';

export default function Export() {
	return (
		<SharedContextProvider>
			<ExportContextProvider>
				<LocationProvider history={ router.appHistory }>
					<Router>
						<ExportComplete path="complete" />
						<ExportPlugins path="plugins" />
						<ExportProcess path="process" />
						<ExportKit default />
					</Router>
				</LocationProvider>
			</ExportContextProvider>
		</SharedContextProvider>
	);
}
