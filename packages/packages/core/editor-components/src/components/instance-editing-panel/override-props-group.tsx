import * as React from 'react';
import { useId } from 'react';
import { useStateByElement } from '@elementor/editor-editing-panel';
import { CollapseIcon } from '@elementor/editor-ui';
import { Collapse, ListItemButton, ListItemText, Stack } from '@elementor/ui';

import { type OverridableProp, type OverridablePropsGroup } from '../../types';

type Props = {
	group: OverridablePropsGroup;
	props: Record< string, OverridableProp >;
};

export function OverridePropsGroup( { group, props }: Props ) {
	const [ isOpen, setIsOpen ] = useStateByElement( group.id, true );

	const handleClick = () => {
		setIsOpen( ! isOpen );
	};

	const id = useId();
	const labelId = `label-${ id }`;
	const contentId = `content-${ id }`;

	const title = group.label;

	return (
		<>
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
				<Stack direction="column" gap={ 1 } p={ 2 }>
					{ group.props.map( ( propId ) => (
						// TODO: Render actual controls
						<pre key={ propId }>{ JSON.stringify( props[ propId ], null, 2 ) }</pre>
					) ) }
				</Stack>
			</Collapse>
		</>
	);
}
