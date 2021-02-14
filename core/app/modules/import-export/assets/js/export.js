import ExportContext from './context/export/export-context';
import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import ExportEntry from './pages/export/export-entry';

export default function Export() {
	return (
		<ExportContext>
			<LocationProvider history={ router.appHistory }>
				<Router>
					<ExportEntry default />
				</Router>
			</LocationProvider>
		</ExportContext>
	);
}
