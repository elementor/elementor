import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import createComponent from '../actions/create-component';
import { type CreateComponentPayload } from '../api';
import { selectCreateStatus } from '../store';

export const useCreateComponentMutation = () => {
	const dispatch = useDispatch();
	const createStatus = useSelector( selectCreateStatus );

	const createComponentAction = async ( payload: CreateComponentPayload ) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = await dispatch( createComponent( payload ) as any );
		return result.payload;
	};

	return {
		createComponent: createComponentAction,
		isPending: createStatus === 'pending',
		error: createStatus === 'error',
	};
};
