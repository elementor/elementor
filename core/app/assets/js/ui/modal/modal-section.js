import { arrayToClassName } from '../../utils/utils';

export default function ModalSection( props ) {
	return (
		<div className={ arrayToClassName( [ 'eps-modal__section', props.className ] ) }>
			{ props.children }
		</div>
	);
}

ModalSection.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
};

ModalSection.defaultProps = {
	className: '',
};
