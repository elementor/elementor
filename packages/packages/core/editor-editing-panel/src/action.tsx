import * as React from 'react';
import { type ElementType as ReactElementType } from 'react';
import { IconButton, Tooltip } from '@elementor/ui';

const SIZE = 'tiny';

type ActionProps = {
	title: string;
	visible?: boolean;
	icon: ReactElementType;
	onClick: () => void;
};

export default function Action( { title, visible = true, icon: Icon, onClick }: ActionProps ) {
	if ( ! visible ) {
		return null;
	}

	return (
		<Tooltip placement="top" title={ title } arrow={ true }>
			<IconButton aria-label={ title } size={ SIZE } onClick={ onClick }>
				<Icon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
}
