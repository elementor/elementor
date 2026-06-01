import * as React from 'react';
import { PropKeyProvider } from '@elementor/editor-controls';
import { type Props, type PropsSchema } from '@elementor/editor-props';

import { extractDependencyEffect } from '../utils/prop-dependency-utils';

type ObjectPropFieldProps = React.PropsWithChildren< {
	bind: string;
	shape: PropsSchema;
	settings: Props;
} >;

export const ObjectPropField = ( { bind, shape, settings, children }: ObjectPropFieldProps ) => {
	const { isHidden } = extractDependencyEffect( bind, shape, settings );

	if ( isHidden ) {
		return null;
	}

	return <PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>;
};
