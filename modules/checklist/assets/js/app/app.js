import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { useQuery } from '@elementor/query';
import Checklist from './components/checklist';
import { STEPS_ROUTE, USER_PROGRESS_ROUTE } from '../utils/consts';
import { useEffect } from 'react';

const fetchSteps = async () => {
	const response = await $e.data.get( STEPS_ROUTE, {}, { refresh: true } );

	return response?.data?.data || null;
};

const fetchStatus = async () => {
	const response = await $e.data.get( USER_PROGRESS_ROUTE, {}, { refresh: true } );

	return response?.data?.data || null;
};

const App = () => {
	const isRTL = elementorCommon.config.isRTL,
		{ error: stepsError, data: steps, refetch: refetchStatus } = useQuery( {
			queryKey: [ 'steps' ],
			queryFn: fetchSteps,
			gcTime: 0,
			enabled: false,
		} ),
		{ error: userProgressError, data: userProgress, refetch: refetchUserProgress } = useQuery( {
			queryKey: [ 'statusData' ],
			queryFn: fetchStatus,
			gcTime: 0,
			enabled: false,
		} );

	const fetchData = () => {
		refetchStatus();
		refetchUserProgress();
	};

	useEffect( () => {
		fetchData();

		elementor.saver.on( 'after:save', fetchData );

		return () => {
			elementor.saver.off( 'after:save', fetchData );
		};
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
