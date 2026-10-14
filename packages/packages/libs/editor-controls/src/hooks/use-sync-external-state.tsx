import { useEffect, useState } from 'react';
import { type CreateOptions } from '@elementor/editor-props';

import { type SetValueMeta } from '../bound-prop-context';

type UseInternalStateOptions< TValue > = {
	external: TValue | null;
	setExternal: ( value: TValue | null, options?: CreateOptions, meta?: SetValueMeta ) => void;
	persistWhen: ( value: TValue | null ) => boolean;
	fallback: ( value: TValue | null ) => TValue;
};

export const useSyncExternalState = < TValue, >( {
	external,
	setExternal,
	persistWhen,
	fallback,
}: UseInternalStateOptions< TValue > ) => {
	function toExternal( internalValue: TValue | null ) {
		if ( persistWhen( internalValue ) ) {
			return internalValue;
		}

		return null;
	}

	function toInternal( externalValue: TValue | null, internalValue: TValue | null ) {
		if ( ! externalValue ) {
			return fallback( internalValue );
		}

		return externalValue;
	}

	const [ internal, setInternal ] = useState< TValue >( toInternal( external, null ) );

	useEffect( () => {
		setInternal( ( prevInternal ) => toInternal( external, prevInternal ) );

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ external ] );

	type SetterFunc = ( value: TValue ) => TValue;

	const setInternalValue = ( setter: SetterFunc | TValue, options?: CreateOptions, meta?: SetValueMeta ) => {
		const setterFn = ( typeof setter === 'function' ? setter : () => setter ) as SetterFunc;
		const updated = setterFn( internal );

		setInternal( updated );
		setExternal( toExternal( updated ), options, meta );
	};

	return [ internal, setInternalValue ] as const;
};
