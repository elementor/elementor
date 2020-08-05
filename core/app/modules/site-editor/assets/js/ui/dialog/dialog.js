import './dialog.scss';

export default function Modal( props ) {
	const WrapperTag = props.wrapperTag;
	const wrapperProps = {
		...'form' === props.wrapperTag && { onSubmit: props.onSubmit },
	};

	return (
		<section className="eps-modal__overlay">
			<WrapperTag className="eps-modal eps-dialog" {...wrapperProps}>
				{ props.children }
			</WrapperTag>
		</section>
	);
}

Modal.propTypes = {
	wrapperTag: PropTypes.string,
	onSubmit: PropTypes.func,
	children: PropTypes.any,
};

Modal.defaultProps = {
	wrapperTag: 'div',
	onSubmit: () => {},
};
