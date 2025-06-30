import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';
import ExportKit from './pages/export-kit';

export default function Export() {
	return (
		<LocationProvider history={ router.appHistory }>
			<Router>
				<ExportKit default />
			</Router>
		</LocationProvider>
	);
}
