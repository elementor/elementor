import Favorites from './pages/favorites/favorites';
import Index from './pages/index';
import Cloud from './pages/cloud/cloud';
import Overview from './pages/overview/overview';
import Preview from './pages/preview/preview';
import { LastFilterProvider } from './context/last-filter-context';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Router } from '@reach/router';
import { SettingsProvider } from './context/settings-context';
import useCloudKitsEligibility from './hooks/use-cloud-kits-eligibility';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 1000 * 60 * 30, // 30 minutes
		},
	},
} );

function AppContent() {
	const { data: isCloudKitsAvailable } = useCloudKitsEligibility();

	return (
		<SettingsProvider value={ elementorAppConfig[ 'kit-library' ] }>
			<LastFilterProvider>
				<Router>
					<Index path="/" />
					<Favorites path="/favorites" />
					<Preview path="/preview/:id" />
					<Overview path="/overview/:id" />
					{ isCloudKitsAvailable && <Cloud path="/cloud" /> }
				</Router>
			</LastFilterProvider>
		</SettingsProvider>
	);
}

export default function App() {
	return (
		<div className="e-kit-library">
			<QueryClientProvider client={ queryClient }>
				<AppContent />
				{ elementorCommon.config.isElementorDebug && <ReactQueryDevtools initialIsOpen={ false } /> }
			</QueryClientProvider>
		</div>
	);
}
