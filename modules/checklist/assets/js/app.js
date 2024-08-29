import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { QueryClient, QueryClientProvider, useQuery } from '@elementor/query';
import Checklist from './components/checklist';

const fetchSteps = async () => {
	const response = await fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/steps`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': elementorWebCliConfig.nonce,
		},
	} );

	if ( 200 !== response.status ) {
		return null;
	}

	const data = await response.json();

	return data.data;
};

const queryClient = new QueryClient();

const AppContent = () => {
	const isRTL = elementorCommon.config.isRTL;
	const { error, data: steps } = useQuery( {
		queryKey: [ 'steps' ],
		queryFn: fetchSteps,
	} );

	if ( error || ! steps || 0 === steps.length ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<Checklist steps={ steps } />
			</ThemeProvider>
		</DirectionProvider>
	);
};

const App = () => (
	<QueryClientProvider client={ queryClient }>
		<AppContent />
	</QueryClientProvider>
);

export default App;
