import * as React from 'react';
import { type ComponentProps, type ComponentType } from 'react';
import { ErrorBoundary } from '@elementor/ui';

import { useControlReplacement } from './control-replacements';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponentType = ComponentType< any >;

const brandSymbol = Symbol( 'control' );

export type ControlComponent< TComponent extends AnyComponentType = AnyComponentType > = TComponent & {
	[ brandSymbol ]: true;
};

export function createControl< T extends AnyComponentType >( Control: T ) {
	return ( ( props: ComponentProps< T > ) => {
		const Component = useControlReplacement( Control );

		return (
			<ErrorBoundary fallback={ null }>
				<Component { ...props } />
			</ErrorBoundary>
		);
	} ) as ControlComponent< T >;
}
