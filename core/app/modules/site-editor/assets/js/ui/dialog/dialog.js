import Icon from 'elementor-app/ui/atoms/icon';
import './dialog.scss';

export default function Dialog( props ) {
	const WrapperTag = props.wrapperTag;
	const wrapperProps = {
		...'form' === props.wrapperTag && { onSubmit: props.onSubmit },
	};

	return (
		<section className="eps-modal__overlay">
			{ props.onClose && <Icon className="eps-dialog__x eicon-close"/> }
			<WrapperTag className="eps-modal eps-dialog" { ...wrapperProps }>
				{ props.children }
			</WrapperTag>
		</section>
	);
}

Dialog.propTypes = {
	wrapperTag: PropTypes.string,
	onSubmit: PropTypes.func,
	children: PropTypes.any,
	onClose: PropTypes.func,
};

Dialog.defaultProps = {
	wrapperTag: 'div',
	onSubmit: () => {},
};
