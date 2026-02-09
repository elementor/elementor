import { useState } from 'react';

export const useInteractions = () => {
	const [ value, setValue ] = useState();

	return { value, setValue };
};
