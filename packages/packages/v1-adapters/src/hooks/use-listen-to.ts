import { useEffect, useState } from 'react';
import { EventDescriptor, listenTo } from '../listeners';

export default function useListenTo<T>(
	event: EventDescriptor | EventDescriptor[],
	getSnapshot: () => T,
	deps: unknown[] = []
) {
	const [ snapshot, setSnapshot ] = useState( () => getSnapshot() );

	useEffect( () => {
		const updateState = () => setSnapshot( getSnapshot() );

		// Ensure the state is re-calculated when the dependencies have been changed.
		updateState();

		const cleanup = listenTo( event, updateState );

		return cleanup;
	}, deps );

	return snapshot;
}
