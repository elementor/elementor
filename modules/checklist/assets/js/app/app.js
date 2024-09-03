import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { QueryClient, QueryClientProvider, useQuery } from '@elementor/query';
import Checklist from './components/checklist';

const fetchSteps = async () => {
	const response = await $e.data.get( 'checklist/steps' );

	return response?.data?.data || null;
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
