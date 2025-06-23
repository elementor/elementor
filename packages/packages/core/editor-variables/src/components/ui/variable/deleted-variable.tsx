import * as React from 'react';
import { useRef } from 'react';
import { Box } from '@elementor/ui';

import { type Variable } from '../../../types';
import { DeletedTag } from '../tags/deleted-tag';

type Props = {
	variable: Variable;
};

export const DeletedVariable = ( { variable }: Props ) => {
	const anchorRef = useRef< HTMLDivElement >( null );

	return (
		<Box ref={ anchorRef }>
			<DeletedTag label={ variable.label } />
		</Box>
	);
};
