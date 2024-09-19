import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { useQuery } from '@elementor/query';
import Checklist from './components/checklist';

const fetchSteps = async () => {
	const response = await $e.data.get( 'checklist/steps', {}, { refresh: true } );

	return response?.data?.data || null;
};

const fetchStatus = async () => {
	const response = await $e.data.get( 'checklist/user-progress', {}, { refresh: true } );

	return response?.data?.data || null;
};

const App = () => {
	const isRTL = elementorCommon.config.isRTL,
		{ error: stepsError, data: steps } = useQuery( {
		queryKey: [ 'steps' ],
		queryFn: fetchSteps,
	} ),
		{ error: userProgressError, data: userProgress } = useQuery( {
			queryKey: [ 'statusData' ],
			queryFn: fetchStatus,
		} );

	if ( userProgressError || ! userProgress || stepsError || ! steps || 0 === steps.length ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<Checklist steps={ [ ...steps ] } userProgress={ userProgress } />
			</ThemeProvider>
		</DirectionProvider>
	);
};

export default App;
