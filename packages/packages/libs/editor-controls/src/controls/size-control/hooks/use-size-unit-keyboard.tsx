import type * as React from 'react';

import { useTypingBuffer } from '../../../hooks/use-typing-buffer';
import { type SizeUnit } from '../types';
import { isExtendedUnit } from '../utils/is-extended-unit';

const UNIT_KEY_PATTERN = /^[a-zA-Z%]$/;

type Props = {
	unit: SizeUnit;
	units: SizeUnit[];
	onUnitChange: ( unit: SizeUnit ) => void;
};

export const useSizeUnitKeyboard = ( { unit, units, onUnitChange }: Props ) => {
	const { appendKey, startsWith } = useTypingBuffer();

	const onUnitKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( units.length === 0 ) {
			return;
		}

		const { key, altKey, ctrlKey, metaKey } = event;

		if ( altKey || ctrlKey || metaKey ) {
			return;
		}

		if ( isExtendedUnit( unit ) && isNumericValue( key ) ) {
			const [ defaultUnit ] = units;

			if ( defaultUnit ) {
				onUnitChange( defaultUnit );
			}

			return;
		}

		if ( ! UNIT_KEY_PATTERN.test( key ) ) {
			return;
		}

		event.preventDefault();

		const updatedBuffer = appendKey( key.toLowerCase() );
		const matchedUnit = units.find( ( u ) => startsWith( u, updatedBuffer ) );

		if ( matchedUnit ) {
			onUnitChange( matchedUnit );
		}
	};

	return { onUnitKeyDown };
};

const isNumericValue = ( value: unknown ): boolean => {
	if ( typeof value === 'number' ) {
		return ! isNaN( value );
	}

	if ( typeof value === 'string' ) {
		return value.trim() !== '' && ! isNaN( Number( value ) );
	}

	return false;
};
