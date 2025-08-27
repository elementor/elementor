import * as React from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ColorIndicator } from '../components/ui/color-indicator';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { service } from '../service';
import { resolveCssVariable } from './utils/resolve-css-variable';

export const inheritanceTransformer = createTransformer( ( id: string ) => {
	const variables = service.variables();
	const variable = variables[ id ];

	if ( ! variable ) {
		return <span>{ __( 'Missing variable', 'elementor' ) }</span>;
	}

	const showColorIndicator = variable.type === colorVariablePropTypeUtil.key;
	const css = resolveCssVariable( id, variable );

	return (
		<Stack direction="row" spacing={ 0.5 } sx={ { paddingInline: '1px' } } alignItems="center">
			{ showColorIndicator && <ColorIndicator size="inherit" value={ variable.value } /> }
			<Typography variant="caption" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
				{ css }
			</Typography>
		</Stack>
	);
} );
