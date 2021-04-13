import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Router } from '@reach/router';
import { SettingsProvider } from './context/settings-context';
import Index from './pages';
import Item from './pages/item';
import Preview from './pages/preview';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 1000 * 60 * 30, // 30 minutes
		},
	},
} );

const isDebug = elementorCommon.config.isDebug || false;

export default function App() {
	return (
		<div className="e-kit-library">
			<QueryClientProvider client={ queryClient }>
				<SettingsProvider value={ elementorAppConfig[ 'kit-library' ] }>
					<Router>
						<Index path="/"/>
						<Preview path="/preview/:id"/>
						<Item path="/:id"/>
					</Router>
				</SettingsProvider>
				{ isDebug && <ReactQueryDevtools initialIsOpen={ false }/> }
			</QueryClientProvider>
		</div>
	);
}
