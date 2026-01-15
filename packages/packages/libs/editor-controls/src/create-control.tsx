import * as React from 'react';
import { type ComponentProps, type ComponentType } from 'react';
import { ErrorBoundary } from '@elementor/ui';

import { ActiveReplacementsProvider, useControlReplacement } from './control-replacements';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponentType = ComponentType< any >;

const brandSymbol = Symbol( 'control' );

export type ControlComponent< TComponent extends AnyComponentType = AnyComponentType > = TComponent & {
	[ brandSymbol ]: true;
};

export function createControl< T extends AnyComponentType >( Control: T ) {
	const WrappedControl = ( ( props: ComponentProps< T > ) => {
		const { ControlToRender, isReplaced, replacementId } = useControlReplacement( Control );
		const controlProps = isReplaced ? { ...props, OriginalControl: WrappedControl } : props;

		if ( isReplaced && replacementId ) {
			return (
				<ErrorBoundary fallback={ null }>
					<ActiveReplacementsProvider replacementId={ replacementId }>
						<ControlToRender { ...controlProps } />
					</ActiveReplacementsProvider>
				</ErrorBoundary>
			);
		}

		return (
			<ErrorBoundary fallback={ null }>
				<ControlToRender { ...controlProps } />
			</ErrorBoundary>
		);
	} ) as ControlComponent< T >;

	return WrappedControl;
}
