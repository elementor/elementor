import * as React from 'react';
import type { ComponentProps } from 'react';

import { useElement } from '../contexts/element-context';
import { ControlTypeNotFoundError } from '../errors';
import { type ControlType, type ControlTypes, getControl } from './controls-registry';

type IsRequired< T, K extends keyof T > = object extends Pick< T, K > ? false : true;

type AnyPropertyRequired< T > = {
	[ K in keyof T ]: IsRequired< T, K >;
}[ keyof T ] extends true
	? true
	: false;

type ControlProps< T extends ControlType > = AnyPropertyRequired< ComponentProps< ControlTypes[ T ] > > extends true
	? {
			props: ComponentProps< ControlTypes[ T ] >;
			type: T;
	  }
	: {
			props?: ComponentProps< ControlTypes[ T ] >;
			type: T;
	  };

export const Control = < T extends ControlType >( { props, type }: ControlProps< T > ) => {
	const ControlByType = getControl( type );
	const { element } = useElement();

	if ( ! ControlByType ) {
		throw new ControlTypeNotFoundError( {
			context: { controlType: type },
		} );
	}

	// @ts-expect-error ControlComponent props are inferred from the type (T).
	return <ControlByType { ...props } context={ { elementId: element.id } } />;
};
