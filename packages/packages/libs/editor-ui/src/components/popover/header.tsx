import * as React from 'react';
import { CloseButton, Stack, Typography } from '@elementor/ui';

const SIZE = 'tiny';

type PopoverHeaderProps = {
	title: React.ReactNode;
	onClose: () => void;
	icon?: React.ReactNode;
	actions?: React.ReactNode[];
};

export const PopoverHeader = ( { title, onClose, icon, actions }: PopoverHeaderProps ) => {
	const paddingAndSizing = {
		pl: 2,
		pr: 1,
		py: 1.5,
		maxHeight: 36,
	};

	return (
		<Stack direction="row" alignItems="center" { ...paddingAndSizing } sx={ { columnGap: 0.5 } }>
			{ icon }
			<Typography variant="subtitle2" sx={ { fontSize: '12px', mt: 0.25 } }>
				{ title }
			</Typography>
			<Stack direction="row" sx={ { ml: 'auto' } }>
				{ actions }
				<CloseButton slotProps={ { icon: { fontSize: SIZE } } } sx={ { ml: 'auto' } } onClick={ onClose } />
			</Stack>
		</Stack>
	);
};
