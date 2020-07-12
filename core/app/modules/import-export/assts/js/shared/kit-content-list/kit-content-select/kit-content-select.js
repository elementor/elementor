import './kit-content-select.scss';

export default function KitContentSelect( props ) {
	return (
		<select className="kit-content-select">
			{
				props.options.map( ( option, index ) => <option key={ index }>{ option }</option> )
			}
		</select>
	);
}

KitContentSelect.propTypes = {
	options: PropTypes.array,
};

KitContentSelect.defaultProps = {};
