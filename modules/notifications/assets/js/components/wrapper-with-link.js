import { Link } from '@elementor/ui';

export const WrapperWithLink = ( props ) => {
	const { link, children } = props;

	if ( ! link ) {
		return children;
	}

	return (
		<Link
			href={ link }
			target="_blank"
			underline="none"
			color="inherit"
			sx={ {
				'&:hover': {
					color: 'inherit',
				},
			} }
		>
			{ children }
		</Link>
	);
};

WrapperWithLink.propTypes = {
	link: PropTypes.string,
	children: PropTypes.any.isRequired,
};
