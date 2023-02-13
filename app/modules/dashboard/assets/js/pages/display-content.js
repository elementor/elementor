export default function DisplayContent( props ) {
	return (
		<>
			{
				'iframe' === props.type &&
				<iframe
					className={ 'e-dashboard__iframe' }
					src={ props.src }
				/>
			}
			{
				'image' === props.type &&
				<img
					width={ '1024px' }
					className={ 'e-dashboard__img' }
					src={ `${ elementorAppConfig.assets_url }images/dashboard/${ props.src }` }
				/>
			}
		</>
	);
}

DisplayContent.propTypes = {
	type: PropTypes.string,
	src: PropTypes.string,
};
