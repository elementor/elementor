import React from 'react';
import ConnectComponent from 'elementor-common-modules/connect/assets/js/e-component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Test } from './test';

window.top.$e.components.register( new ConnectComponent() );

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			enabled: false,
		},
	},
} );

const App = () => {
	return (
		<React.Fragment>
			<QueryClientProvider client={ queryClient }>
				<Test />
			</QueryClientProvider>
		</React.Fragment>
	);
};

export default App;
