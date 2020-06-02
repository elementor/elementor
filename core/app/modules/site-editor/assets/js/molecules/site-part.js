import './site-part.scss';

export default function SitePart( props ) {
	return (
		<section id={ `site-part__type-${ props.type }` } className="e-app__site-editor__site-part">
			<header>
				{ props.title }
				<a target="_blank" rel="noopener noreferrer" href={ props.urls.docs } >
					<i className="eicon-info" aria-hidden="true" title={ __( 'Help', 'elementor' ) } />
				</a>
			</header>
			<main>
				<div className="hover-content">
					{ props.children }
				</div>
			</main>
		</section>
	);
}

SitePart.propTypes = {
	type: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	className: PropTypes.string,
	urls: PropTypes.object,
	children: PropTypes.object.isRequired,
};

SitePart.defaultProps = {
	className: '',
};
