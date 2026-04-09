import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

import { type ComponentInstanceOverridesPropValue } from '../prop-types/component-instance-overrides-prop-type';
import { type OverridableProps } from '../types';

type ComponentInstanceData = {
	componentId: number;
	overrides: ComponentInstanceOverridesPropValue;
	overridableProps: OverridableProps;
};

const ComponentInstanceContext = createContext< ComponentInstanceData | null >( null );

export function ComponentInstanceProvider( { children, ...props }: PropsWithChildren< ComponentInstanceData > ) {
	return <ComponentInstanceContext.Provider value={ props }>{ children }</ComponentInstanceContext.Provider>;
}

function useComponentInstanceContext() {
	const context = useContext( ComponentInstanceContext );

	if ( ! context ) {
		throw new Error( 'useComponentInstanceContext must be used within a ComponentInstanceProvider' );
	}

	return context;
}

export const useComponentId = () => useComponentInstanceContext().componentId;
export const useComponentInstanceOverrides = () => useComponentInstanceContext().overrides;
export const useComponentOverridableProps = () => useComponentInstanceContext().overridableProps;
