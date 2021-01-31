import ExportContext from './context/export/export-context';
import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';

import ExportKit from './pages/export/export-kit/export-kit';
import ExportComplete from './pages/export/export-complete/export-complete';

export default function Export() {
	return (
		<ExportContext>
			<LocationProvider history={ router.appHistory }>
				<Router>
					<ExportComplete path="complete" />
					<ExportKit default />
				</Router>
			</LocationProvider>
		</ExportContext>
	);
}
