import { ExportConsumer } from '../../../context/export';
import { ImportConsumer } from '../../../context/import';

export default function Consumer( props ) {
	const ConsumerType = 'export' === props.type ? ExportConsumer : ImportConsumer;

	return (
		<ConsumerType>
			{ props.children }
		</ConsumerType>
	);
}

Consumer.propTypes = {
	type: PropTypes.string.isRequired,
	children: PropTypes.oneOfType( [
		PropTypes.func,
	] ).isRequired,
};
