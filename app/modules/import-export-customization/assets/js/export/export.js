import { LocationProvider, Router } from '@reach/router';
import router from '@elementor/router';
import { ExportContextProvider } from '../context/export-context';
import { QueryClientProvider, QueryClient } from 'react-query';
import ExportKit from './pages/export-kit';
import ExportProcess from './pages/export-process';
import ExportComplete from './pages/export-complete';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 1000 * 60 * 30, // 30 minutes
		},
	},
} );

export default function Export() {
	return (
		<QueryClientProvider client={ queryClient }>
			<ExportContextProvider>
				<LocationProvider history={ router.appHistory }>
					<Router>
						<ExportKit path="/" default />
						<ExportProcess path="/process" />
						<ExportComplete path="/complete" />
					</Router>
				</LocationProvider>
			</ExportContextProvider>
		</QueryClientProvider>
	);
}
