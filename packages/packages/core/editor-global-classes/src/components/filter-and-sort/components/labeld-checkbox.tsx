import * as React from 'react';
import { Checkbox, MenuItem, Stack, Typography } from '@elementor/ui';

type LabeledCheckboxProps = {
	label: string;
	suffix?: React.ReactNode;
	onClick: () => void;
	checked: boolean;
};

export const LabeledCheckbox = ({ label, suffix, onClick, checked }: LabeledCheckboxProps) => (
	<MenuItem onClick={onClick}>
		<Stack direction="row" alignItems="center" gap={0.5} flex={1}>
			<Checkbox
				checked={checked}
				sx={{
					padding: 0,
					color: 'text.tertiary',
					'&:hover': {
						backgroundColor: 'transparent',
					},
					'&.Mui-checked:hover': {
						backgroundColor: 'transparent',
					},
					'&.Mui-checked': {
						color: 'text.tertiary',
					},
				}}
			/>
			<Typography variant="caption" sx={{ color: 'text.secondary' }}>
				{label}
			</Typography>
			{suffix}
		</Stack>
	</MenuItem>
);
