import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { useQuery } from '@elementor/query';
import Checklist from './components/checklist';
import { fetchSteps, fetchUserProgress } from '../utils/functions';

const App = () => {
	const isRTL = elementorCommon.config.isRTL,
		{ error: stepsError, data: steps } = useQuery( {
		queryKey: [ 'steps' ],
		queryFn: fetchSteps,
		gcTime: 0,
	} ),
		{ error: userProgressError, data: userProgress } = useQuery( {
			queryKey: [ 'statusData' ],
			queryFn: fetchUserProgress,
			gcTime: 0,
		} );

	if ( userProgressError || ! userProgress || stepsError || ! steps?.length ) {
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
