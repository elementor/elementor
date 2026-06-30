import * as React from 'react';
import { forwardRef } from 'react';
import { Box, styled, Tooltip } from '@elementor/ui';

type EditableFieldProps< T extends React.ElementType > = {
	value: string;
	error?: string;
	as?: T;
} & React.ComponentPropsWithRef< T >;

export const EditableField = forwardRef(
	< T extends React.ElementType >(
		{ value, error, as = 'span', sx, ...props }: EditableFieldProps< T >,
		ref: unknown
	) => {
		return (
			<Tooltip title={ error } open={ !! error } placement="top">
				<StyledField ref={ ref } component={ as } { ...props }>
					{ value }
				</StyledField>
			</Tooltip>
		);
	}
);

const StyledField = styled( Box )`
	width: 100%;
	&:focus {
		outline: none;
	}
`;
