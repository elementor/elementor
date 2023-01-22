import { Tooltip as BaseTooltip, styled, tooltipClasses, TooltipProps } from '@elementor/ui';

const StyledTooltip = styled( ( { className, ...props }: TooltipProps ) => (
	<BaseTooltip { ...props } arrow classes={ { popper: className } } />
) )( () => ( {
	[ `& .${ tooltipClasses.tooltip }` ]: {
		backgroundColor: '#232629',
	},

	[ `& .${ tooltipClasses.arrow }` ]: {
		color: '#232629',
	},
} ) );

export default function Tooltip( props: TooltipProps ) {
	return <StyledTooltip { ...props } />;
}
