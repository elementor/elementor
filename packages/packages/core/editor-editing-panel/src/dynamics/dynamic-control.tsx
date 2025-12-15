import * as React from 'react';
import { PropKeyProvider, PropProvider, type SetValue, useBoundProp } from '@elementor/editor-controls';
import { type PropKey } from '@elementor/editor-props';

import { createTopLevelObjectType } from '../controls-registry/create-top-level-object-type';
import { DynamicConditionalControl } from './components/dynamic-conditional-control';
import { useDynamicTag } from './hooks/use-dynamic-tag';
import { dynamicPropTypeUtil, type DynamicPropValue } from './utils';

type DynamicControlProps = React.PropsWithChildren< {
	bind: PropKey;
} >;

export const DynamicControl = ( { bind, children }: DynamicControlProps ) => {
	const { value, setValue } = useBoundProp( dynamicPropTypeUtil );
	const { name = '', group = '', settings } = value ?? {};

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
			group,
			settings: {
				...settings,
				...newValues,
			},
		} );
	};

	const propType = createTopLevelObjectType( { schema: dynamicTag.props_schema } );

	return (
		<PropProvider propType={ propType } setValue={ setDynamicValue } value={ { [ bind ]: dynamicValue } }>
			<PropKeyProvider bind={ bind }>
				<DynamicConditionalControl
					propType={ dynamicPropType }
					propsSchema={ dynamicTag.props_schema }
					dynamicSettings={ settings }
				>
					{ children }
				</DynamicConditionalControl>
			</PropKeyProvider>
		</PropProvider>
	);
};
