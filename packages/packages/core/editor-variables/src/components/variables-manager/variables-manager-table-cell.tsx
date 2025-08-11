import * as React from 'react';
import { type SxProps, TableCell } from '@elementor/ui';

type VariableTableCellProps = {
	children?: React.ReactNode;
	isHeader?: boolean;
	width?: number;
	maxWidth?: number;
	align?: 'left' | 'right' | 'center';
	noPadding?: boolean;
};

export const VariableTableCell = ( {
	children,
	isHeader,
	width,
	maxWidth,
	align,
	noPadding,
}: VariableTableCellProps ) => {
	const baseSx: SxProps = {
		maxWidth: maxWidth ?? 150,
		cursor: 'initial',
		typography: isHeader ? 'subtitle2' : 'caption',
		...( isHeader && { color: 'text.primary' } ),
		...( width && { width } ),
	};

	return (
		<TableCell size="small" padding={ noPadding ? 'none' : undefined } align={ align } sx={ baseSx }>
			{ children }
		</TableCell>
	);
};
