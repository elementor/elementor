import { __useDispatch as useDispatch, __useSelector as useSelector, type AsyncThunkAction } from '@elementor/store';

import { createComponent } from '../actions';
import { type CreateComponentPayload, type CreateComponentResponse } from '../api';
import { selectCreateStatus } from '../store';

export const useCreateComponentMutation = () => {
	const dispatch = useDispatch();
	const createStatus = useSelector( selectCreateStatus );

	const createComponentAction = async ( payload: CreateComponentPayload ) => {
		const result = await dispatch(
			createComponent( payload ) as AsyncThunkAction<
				CreateComponentResponse,
				CreateComponentPayload,
				{ rejectValue: string }
			>
		);
		return result.payload;
	};

	return {
		createComponent: createComponentAction,
		isPending: createStatus === 'pending',
		error: createStatus === 'error',
	};
};
