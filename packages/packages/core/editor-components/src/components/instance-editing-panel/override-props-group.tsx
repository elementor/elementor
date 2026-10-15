import * as React from 'react';
import { useId } from 'react';
import { useStateByElement } from '@elementor/editor-editing-panel';
import { CollapseIcon } from '@elementor/editor-ui';
import { Box, Collapse, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import { type OverridablePropsGroup } from '../../types';
import { OverridePropControl } from './override-prop-control';
import { OVERRIDE_PROPS_GROUP_CONTENT_CLASS } from './override-props-group-constants';

type Props = {
	group: OverridablePropsGroup;
};

export function OverridePropsGroup( { group }: Props ) {
	const [ isOpen, setIsOpen ] = useStateByElement( group.id, true );

	const handleClick = () => {
		setIsOpen( ! isOpen );
	};

	const id = useId();
	const labelId = `label-${ id }`;
	const contentId = `content-${ id }`;

	const title = group.label;

	return (
		<Box
			aria-label={ `${ title } section` }
			sx={ { [ `&:has(.${ OVERRIDE_PROPS_GROUP_CONTENT_CLASS }:empty)` ]: { display: 'none' } } }
		>
			<ListItemButton
				id={ labelId }
				aria-controls={ contentId }
				aria-label={ `${ title } section` }
				onClick={ handleClick }
				p={ 0 }
				sx={ { '&:hover': { backgroundColor: 'transparent' } } }
			>
				<Stack direction="row" alignItems="center" justifyItems="start" flexGrow={ 1 } gap={ 0.5 }>
					<ListItemText
						secondary={ title }
						secondaryTypographyProps={ { color: 'text.primary', variant: 'caption', fontWeight: 'bold' } }
						sx={ { flexGrow: 0, flexShrink: 1, marginInlineEnd: 1 } }
					/>
				</Stack>
				<CollapseIcon open={ isOpen } color="secondary" fontSize="tiny" />
			</ListItemButton>
			<Collapse id={ contentId } aria-labelledby={ labelId } in={ isOpen } timeout="auto">
				<Stack className={ OVERRIDE_PROPS_GROUP_CONTENT_CLASS } direction="column" gap={ 1 } p={ 2 }>
					{ group.props.map( ( overrideKey ) => (
						<OverridePropControl key={ overrideKey } overrideKey={ overrideKey } />
					) ) }
				</Stack>
			</Collapse>
		</Box>
	);
}
