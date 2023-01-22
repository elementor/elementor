import { Tooltip as BaseTooltip, styled, tooltipClasses, TooltipProps } from '@elementor/ui';

const StyledTooltip = styled( ( { className, children, ...props }: TooltipProps ) => (
	<BaseTooltip { ...props } arrow classes={ { popper: className } }>{ children }</BaseTooltip>
) )( () => ( {
	[ `& .${ tooltipClasses.tooltip }` ]: {
		backgroundColor: '#232629',
	},

	[ `& .${ tooltipClasses.arrow }` ]: {
		color: '#232629',
	},
} ) );

export default function Tooltip( { children, ...props }: TooltipProps ) {
	return <StyledTooltip { ...props }>{ children }</StyledTooltip>;
}
