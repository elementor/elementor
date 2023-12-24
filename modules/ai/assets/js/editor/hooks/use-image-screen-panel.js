import { useState } from 'react';

const useImageScreenPanel = ( initialScreen, initialPanel ) => {
	const [ screen, setScreen ] = useState( initialScreen );
	const [ panel, setPanel ] = useState( initialPanel );

	return {
		screen,
		setScreen,
		panel,
		setPanel,
	};
};

export default useImageScreenPanel;
