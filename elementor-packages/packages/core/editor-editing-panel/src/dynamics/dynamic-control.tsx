import * as React from 'react';
import { PropKeyProvider, PropProvider, type SetValue, useBoundProp } from '@elementor/editor-controls';
import { type PropKey } from '@elementor/editor-props';

import { createTopLevelOjectType } from '../controls-registry/create-top-level-object-type';
import { useDynamicTag } from './hooks/use-dynamic-tag';
import { dynamicPropTypeUtil, type DynamicPropValue } from './utils';

type DynamicControlProps = React.PropsWithChildren< {
	bind: PropKey;
} >;

export const DynamicControl = ( { bind, children }: DynamicControlProps ) => {
	const { value, setValue } = useBoundProp( dynamicPropTypeUtil );
	const { name = '', settings } = value ?? {};

	const dynamicTag = useDynamicTag( name );

	if ( ! dynamicTag ) {
		throw new Error( `Dynamic tag ${ name } not found` );
	}

	const dynamicPropType = dynamicTag.props_schema[ bind ];

	const defaultValue = dynamicPropType?.default;
	const dynamicValue = settings?.[ bind ] ?? defaultValue;

	const setDynamicValue: SetValue< Record< string, DynamicPropValue > > = ( newValues ) => {
		setValue( {
			name,
			settings: {
				...settings,
				...newValues,
			},
		} );
	};

	const propType = createTopLevelOjectType( { schema: dynamicTag.props_schema } );

	return (
		<PropProvider propType={ propType } setValue={ setDynamicValue } value={ { [ bind ]: dynamicValue } }>
			<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
		</PropProvider>
	);
};
