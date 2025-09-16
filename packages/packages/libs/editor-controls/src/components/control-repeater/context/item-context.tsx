import { createContext } from 'react';

import { type Item, type RepeatablePropValue } from '../types';

export const ItemContext = createContext< { index: number; value: Item< RepeatablePropValue > } >( {
	index: -1,
	value: {} as Item< RepeatablePropValue >,
} );
