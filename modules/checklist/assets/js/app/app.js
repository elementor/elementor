import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { useQuery } from '@elementor/query';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import Checklist from './components/checklist';
import { fetchSteps, fetchUserProgress } from '../utils/functions';
import { useEffect } from 'react';

const App = () => {
	const isRTL = elementorCommon.config.isRTL,
		{ error: stepsError, data: steps, refetch: refetchSteps } = useQuery( {
			queryKey: [ 'steps' ],
			queryFn: fetchSteps,
			gcTime: 0,
			enabled: false,
		} ),
		{ error: userProgressError, data: userProgress, refetch: refetchUserProgress } = useQuery( {
			queryKey: [ 'statusData' ],
			queryFn: fetchUserProgress,
			gcTime: 0,
			enabled: false,
		} );

	const fetchData = () => {
		refetchSteps();
		refetchUserProgress();
	};

	useEffect( () => {
		fetchData();

		return listenTo( commandEndEvent( 'document/save/save' ), ( { args } ) => {
			if ( 'kit' === args?.document?.config?.type ) {
				fetchData();
			}
		} );
	}, [] );

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
