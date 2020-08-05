import Heading from 'elementor-app/ui/atoms/heading';

export default function DialogTitle( props ) {
	return (
		<Heading
			{ ...props }
			className={`eps-dialog__title ${ props.className }`}
		/>
	);
}

DialogTitle.propTypes = {
	...Heading.propTypes,
};

DialogTitle.defaultProps = {
	...Heading.propTypes,
	variant: 'h3',
	tag: 'h3',
};
