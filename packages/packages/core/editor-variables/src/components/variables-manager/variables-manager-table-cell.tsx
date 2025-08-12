import * as React from 'react';
import { type SxProps, TableCell } from '@elementor/ui';

type VariableTableCellProps = {
	children?: React.ReactNode;
	isHeader?: boolean;
	width?: number;
	maxWidth?: number;
	align?: 'left' | 'right' | 'center';
	noPadding?: boolean;
	sx?: SxProps;
};

export const VariableTableCell = ( {
	children,
	isHeader,
	width,
	maxWidth,
	align,
	noPadding,
	sx,
}: VariableTableCellProps ) => {
	const baseSx: SxProps = {
		maxWidth: maxWidth ?? 150,
		cursor: 'initial',
		typography: isHeader ? 'subtitle2' : 'caption',
		...( isHeader && { color: 'text.primary' } ),
		...( width && { width } ),
		...sx,
	};

	return (
		<TableCell size="small" padding={ noPadding ? 'none' : undefined } align={ align } sx={ baseSx }>
			{ children }
		</TableCell>
	);
};
