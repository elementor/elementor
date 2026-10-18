import * as React from 'react';
import { useState } from 'react';
import { getElementSnippetReferences } from '@elementor/editor-elements';
import { Box, Button, Chip, Collapse, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../contexts/element-context';
import { resolveSnippetHandlerRows, type SnippetHandlerRow } from './snippet-handlers';

export const CustomHandlersList = () => {
	const { element } = useElement();
	const rows = resolveSnippetHandlerRows( getElementSnippetReferences( element.id ) );

	if ( ! rows.length ) {
		return null;
	}

	return (
		<Stack gap={ 1.5 } sx={ { p: 2 } }>
			<Typography variant="caption" color="text.secondary">
				{ __( 'Custom', 'elementor' ) }
			</Typography>
			{ rows.map( ( row ) => (
				<CustomHandlerRow key={ `${ row.snippet }:${ row.event }` } row={ row } />
			) ) }
		</Stack>
	);
};

const CustomHandlerRow = ( { row }: { row: SnippetHandlerRow } ) => {
	const [ isCodeVisible, setIsCodeVisible ] = useState( false );

	return (
		<Stack gap={ 0.5 }>
			<Stack direction="row" gap={ 1 } alignItems="center">
				<Chip size="tiny" label={ row.event } />
				<Typography variant="caption" color="text.secondary">
					{ row.snippet }
				</Typography>
			</Stack>
			<Typography variant="body2">{ row.description }</Typography>
			{ row.code !== undefined && (
				<>
					<Button size="tiny" variant="text" onClick={ () => setIsCodeVisible( ( visible ) => ! visible ) }>
						{ isCodeVisible ? __( 'Hide code', 'elementor' ) : __( 'Show code', 'elementor' ) }
					</Button>
					<Collapse in={ isCodeVisible } unmountOnExit>
						<Box
							component="pre"
							sx={ { m: 0, p: 1, overflow: 'auto', fontSize: 12, bgcolor: 'action.hover' } }
						>
							{ row.code }
						</Box>
					</Collapse>
				</>
			) }
		</Stack>
	);
};
