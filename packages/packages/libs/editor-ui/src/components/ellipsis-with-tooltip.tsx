import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Tooltip } from '@elementor/ui';

type EllipsisWithTooltipProps< T extends React.ElementType > = {
	maxWidth?: React.CSSProperties[ 'maxWidth' ];
	title: string;
	as?: T;
} & React.ComponentProps< T >;

export const EllipsisWithTooltip = < T extends React.ElementType >( {
	maxWidth,
	title,
	as,
	...props
}: EllipsisWithTooltipProps< T > ) => {
	const [ setRef, isOverflowing ] = useIsOverflowing();

	if ( isOverflowing ) {
		return (
			<Tooltip title={ title } placement="top">
				<Content maxWidth={ maxWidth } ref={ setRef } as={ as } { ...props }>
					{ title }
				</Content>
			</Tooltip>
		);
	}

	return (
		<Content maxWidth={ maxWidth } ref={ setRef } as={ as } { ...props }>
			{ title }
		</Content>
	);
};

type ContentProps< T extends React.ElementType > = React.PropsWithChildren<
	Omit< EllipsisWithTooltipProps< T >, 'title' >
>;

const Content = React.forwardRef(
	< T extends React.ElementType >(
		{ maxWidth, as: Component = Box, ...props }: ContentProps< T >,
		// forwardRef loses the typing when using generic components.
		ref: unknown
	) => (
		<Component
			ref={ ref }
			position="relative"
			{ ...props }
			style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth } }
		/>
	)
);

const useIsOverflowing = () => {
	const [ el, setEl ] = useState< HTMLElement | null >( null );
	const [ isOverflowing, setIsOverflown ] = useState( false );

	useEffect( () => {
		const observer = new ResizeObserver( ( [ { target } ] ) => {
			setIsOverflown( target.scrollWidth > target.clientWidth );
		} );

		if ( el ) {
			observer.observe( el );
		}

		return () => {
			observer.disconnect();
		};
	}, [ el ] );

	return [ setEl, isOverflowing ] as const;
};
