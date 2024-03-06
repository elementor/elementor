import { Box } from '@elementor/ui';

import Top from './top.js';

const HomeScreen = () => {
	return (
		<Box display="flex" sx={ { flexDirection: 'column' } }>
			<Top />
			<h1>Demo content</h1>
		</Box>
	);
};

export default HomeScreen;
