import * as React from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { CloseButton, Stack, Typography } from '@elementor/ui';

const SIZE = 'tiny';

type PopoverHeaderProps = {
	title: React.ReactNode;
	onClose: () => void;
	icon?: React.ReactNode;
	actions?: React.ReactNode[];
};

const isVersion330Active = isExperimentActive( 'e_v_3_30' );

export const PopoverHeader = ( { title, onClose, icon, actions }: PopoverHeaderProps ) => {
	const paddingAndSizing = isVersion330Active
		? {
				pl: 2,
				pr: 1,
				py: 1.5,
				maxHeight: 36,
		  }
		: {
				pl: 1.5,
				pr: 0.5,
				py: 1.5,
		  };

	return (
		<Stack direction="row" alignItems="center" { ...paddingAndSizing } sx={ { columnGap: 0.5 } }>
			{ icon }
			<Typography
				variant="subtitle2"
				sx={
					isVersion330Active
						? {
								fontSize: '12px',
								mt: 0.25,
						  }
						: undefined
				}
			>
				{ title }
			</Typography>
			<Stack direction="row" sx={ { ml: 'auto' } }>
				{ actions }
				<CloseButton slotProps={ { icon: { fontSize: SIZE } } } sx={ { ml: 'auto' } } onClick={ onClose } />
			</Stack>
		</Stack>
	);
};
