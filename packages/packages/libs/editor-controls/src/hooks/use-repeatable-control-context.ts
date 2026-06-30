import { createContext, useContext } from 'react';
import { type PropTypeUtil } from '@elementor/editor-props';

import type { Item, RepeatablePropValue } from '../components/control-repeater/types';

export type ChildControlConfig = {
	component: React.ComponentType;
	props?: Record< string, unknown >;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	propTypeUtil: PropTypeUtil< string, any >;
	label?: string;
	isItemDisabled?: ( item: Item< RepeatablePropValue > ) => boolean;
};

type RepeatableControlContextType = ChildControlConfig & {
	placeholder: string;
	patternLabel: string;
};

const RepeatableControlContext = createContext< RepeatableControlContextType | undefined >( undefined );

const useRepeatableControlContext = () => {
	const context = useContext( RepeatableControlContext );

	if ( ! context ) {
		throw new Error( 'useRepeatableControlContext must be used within RepeatableControl' );
	}

	return context;
};

export { RepeatableControlContext, useRepeatableControlContext };
