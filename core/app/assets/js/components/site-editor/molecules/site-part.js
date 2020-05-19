import './site-part.css';

export default class SitePart extends React.Component {
	static propTypes = {
		type: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		className: PropTypes.string,
		urls: PropTypes.object,
		children: PropTypes.object.isRequired,
	};

	static defaultProps = {
		className: '',
	};

	render() {
		return (
			<section id={ `site-part__type-${ this.props.type }` } className="elementor-app__site-editor__site-part">
				<header>
					{ this.props.title }
					<a target="_blank" rel="noopener noreferrer" href={ this.props.urls.docs } >
						<i className="eicon-info" aria-hidden="true" title={ __( 'Help', 'elementor' ) } />
					</a>
				</header>
				<main>
					<div className="hover-content">
						{ this.props.children }
					</div>
				</main>
			</section>
		);
	}
}
