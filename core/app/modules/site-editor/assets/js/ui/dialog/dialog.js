import Button from 'elementor-app/ui/molecules/button';
import './dialog.scss';

export default function Dialog( props ) {
	const WrapperTag = props.wrapperTag;
	const wrapperProps = {};

	if ( 'form' === props.wrapperTag ) {
		wrapperProps.onSubmit = props.onSubmit;
	}

	return (
		<section className="eps-modal__overlay">
			{
				props.onClose &&
				<Button
					onClick={ props.onClose }
					text={ __( 'Close', 'elementor' ) }
					hideText={ true }
					icon="eicon-close"
					className="eps-dialog__x"
				/>
			}
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
