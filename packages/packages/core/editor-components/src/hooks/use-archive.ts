import { useCallback } from "react";
import { AnyAction, __useDispatch as useDispatch } from "@elementor/store";
import { slice } from "../store/store";
import { apiClient } from "../api";
import { loadComponents } from "../store/thunks";

export const useArchive = () => {
	const dispatch = useDispatch();

	return useCallback( (componentId: number) => {
		dispatch( slice.actions.archive( componentId ) );
		apiClient.archiveComponent( componentId ).then((res) => {
			if ( res.success ) {
				dispatch( loadComponents() as unknown as AnyAction );
			}
		});
	}, [dispatch] );
};