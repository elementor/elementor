import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import { useQuery } from '@elementor/query';
import Checklist from './components/checklist';

const fetchSteps = async () => {
	const response = await $e.data.get( 'checklist/steps', {}, { refresh: true } );

	return response?.data?.data || null;
};

const App = () => {
	const isRTL = elementorCommon.config.isRTL,
		{ error, data: steps } = useQuery( {
		queryKey: [ 'steps' ],
		queryFn: fetchSteps,
	} );

	if ( error || ! steps || 0 === steps.length ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<Checklist steps={ [ ...steps ] } />
			</ThemeProvider>
		</DirectionProvider>
	);
};

export default App;
