import * as React from 'react';
import { transformPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import { Repeater } from '../../components/repeater';
import { createControl } from '../../create-control';
import { TransformContent } from './transform-content';
import { TransformIcon } from './transform-icon';
import { TransformLabel } from './transform-label';
import { initialTransformValue } from './types';

export const TransformRepeaterControl = createControl( () => {
	const { propType, value: transformValues, setValue, disabled } = useBoundProp( transformPropTypeUtil );

	return (
		<PropProvider propType={ propType } value={ transformValues } setValue={ setValue }>
			<Repeater
				openOnAdd
				disabled={ disabled }
				values={ transformValues ?? [] }
				setValues={ setValue }
				label={ __( 'Transform', 'elementor' ) }
				showDuplicate={ false }
				itemSettings={ {
					Icon: TransformIcon,
					Label: TransformLabel,
					Content: TransformContent,
					initialValues: initialTransformValue,
				} }
			/>
		</PropProvider>
	);
} );
