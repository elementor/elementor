import { __useDispatch as useDispatch, __useSelector as useSelector, type AnyAction } from '@elementor/store';

import { type CreateComponentPayload } from '../api';
import { selectCreateError, selectCreateIsPending } from '../store';
import { createComponent } from '../thunks';

export const useCreateComponent = () => {
	const dispatch = useDispatch();
	const isPending = useSelector( selectCreateIsPending );
	const error = useSelector( selectCreateError );

	const createComponentAction = async ( payload: CreateComponentPayload ) => {
		const result = await dispatch( createComponent( payload ) as unknown as AnyAction );
		return result.payload;
	};

	return {
		createComponent: createComponentAction,
		isPending,
		error,
	};
};
