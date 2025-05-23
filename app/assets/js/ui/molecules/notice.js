import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Text from 'elementor-app/ui/atoms/text';
import Icon from 'elementor-app/ui/atoms/icon';
import Grid from 'elementor-app/ui/grid/grid';

import './notice.scss';

const iconsClassesMap = {
	danger: 'eicon-warning',
	info: 'eicon-info-circle-o',
	warning: 'eicon-warning',
};

export default function Notice( props ) {
	const baseClassName = 'eps-notice',
		classes = [ baseClassName, props.className ];

	if ( props.color ) {
		classes.push( baseClassName + '-semantic', baseClassName + '--' + props.color );
	}

	return (
		<Grid className={ arrayToClassName( classes ) } container noWrap alignItems="center" justify="space-between">
			<Grid item container alignItems="start" noWrap>
				{
					props.withIcon &&
					props.color &&
					<Icon className={ arrayToClassName( [ 'eps-notice__icon', iconsClassesMap[ props.color ] ] ) } />
				}

				<Text variant="xs" className="eps-notice__text">
					{ props.label && <strong>{ props.label + ' ' }</strong> }

					{ props.children }
				</Text>
			</Grid>

			{
				props.button &&
				<Grid item container justify="end" className={ baseClassName + '__button-container' }>
					{ props.button }
				</Grid>
			}
		</Grid>
	);
}

Notice.propTypes = {
	className: PropTypes.string,
	color: PropTypes.string,
	label: PropTypes.string,
	children: PropTypes.any.isRequired,
	icon: PropTypes.string,
	withIcon: PropTypes.bool,
	button: PropTypes.object,
};

Notice.defaultProps = {
	className: '',
	withIcon: true,
	button: null,
};
