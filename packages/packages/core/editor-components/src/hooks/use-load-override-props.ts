import { useEffect } from 'react';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { __useDispatch as useDispatch } from '@elementor/store';

import { overrideActions } from '../components/overridable-props/utils/actions';
import { slice } from '../store/store';
import { type OverridableProps } from '../types';

export const useLoadOverrideProps = () => {
	const currentDocument = getV1CurrentDocument();
	const componentId = currentDocument?.id;
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! componentId ) {
			return;
		}

		overrideActions.load( componentId ).then( ( data ) => {
			dispatch( slice.actions.setOverridableProps( { componentId, overrides: data as OverridableProps } ) );
		} );
	}, [ componentId, dispatch ] );
};
