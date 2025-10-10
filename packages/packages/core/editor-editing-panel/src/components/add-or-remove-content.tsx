import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { MinusIcon, PlusIcon } from '@elementor/icons';
import { Collapse, IconButton, Stack } from '@elementor/ui';

import { SectionContent } from './section-content';

const SIZE = 'tiny';

type Props = {
	isAdded: boolean;
	onAdd: () => void;
	onRemove: () => void;
	disabled?: boolean;
	renderLabel: () => React.ReactNode;
};

export const AddOrRemoveContent = ( {
	isAdded,
	onAdd,
	onRemove,
	children,
	disabled,
	renderLabel,
}: PropsWithChildren< Props > ) => {
	return (
		<SectionContent>
			<Stack
				direction="row"
				sx={ {
					justifyContent: 'space-between',
					alignItems: 'center',
					marginInlineEnd: -0.75,
				} }
			>
				{ renderLabel() }
				{ isAdded ? (
					<IconButton size={ SIZE } onClick={ onRemove } aria-label="Remove" disabled={ disabled }>
						<MinusIcon fontSize={ SIZE } />
					</IconButton>
				) : (
					<IconButton size={ SIZE } onClick={ onAdd } aria-label="Add" disabled={ disabled }>
						<PlusIcon fontSize={ SIZE } />
					</IconButton>
				) }
			</Stack>
			<Collapse in={ isAdded } unmountOnExit>
				<SectionContent>{ children }</SectionContent>
			</Collapse>
		</SectionContent>
	);
};
