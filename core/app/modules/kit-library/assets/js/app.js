import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Router } from '@reach/router';
import Index from './pages';
import Item from './pages/item';
import Preview from './pages/preview';

import './app.scss';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 60 * 3000, // 30 minutes
		},
	},
} );

export default function App() {
	return (
		<QueryClientProvider client={ queryClient }>
			<Router>
				<Index path="/"/>
				<Item path="/:id"/>
				<Preview path="/:id/preview"/>
			</Router>
			<ReactQueryDevtools initialIsOpen={ false }/>
		</QueryClientProvider>
	);
}
