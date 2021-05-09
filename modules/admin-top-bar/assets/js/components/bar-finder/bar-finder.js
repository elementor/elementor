export default function BarFinder( props ) {
	return (
		<button className="top-bar-finder-wrapper" onClick={() => {
			$e.route( 'finder' );
		}}>
			<i className="eicon-search-bold"></i>
			<h1 className="top-bar-finder-title">{ props.children }</h1>
		</button>
	);
}

BarFinder.propTypes = {
	children: PropTypes.any,
};

