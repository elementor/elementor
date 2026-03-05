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

export const useComponentId = () => useContext( ComponentInstanceContext )?.componentId;
export const useComponentInstanceOverrides = () => useContext( ComponentInstanceContext )?.overrides;
export const useComponentOverridableProps = () => useContext( ComponentInstanceContext )?.overridableProps;
