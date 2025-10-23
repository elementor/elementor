import { __useDispatch as useDispatch, __useSelector as useSelector, type AnyAction } from '@elementor/store';

import { type CreateComponentPayload } from '../api';
import { selectCreateIsError, selectCreateIsPending } from '../store/store';
import { createComponent } from '../store/thunks';

export const useCreateComponent = () => {
	const dispatch = useDispatch();
	const isPending = useSelector( selectCreateIsPending );
	const isError = useSelector( selectCreateIsError );

	const createComponentAction = async ( payload: CreateComponentPayload ) => {
		const result = await dispatch( createComponent( payload ) as unknown as AnyAction );
		return result.payload;
	};

	return {
		createComponent: createComponentAction,
		isPending,
		isError,
	};
};
