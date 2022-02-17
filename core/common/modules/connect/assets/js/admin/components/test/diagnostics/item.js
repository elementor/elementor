import styled from 'styled-components';
import { List } from './';

const ItemResult = styled.span`
  color: ${ ( { result } ) => 'true' === result ? 'green' : 'red' };
  font-weight: bold;
`;

const ItemError = styled.span`
  display: block;
  color: red;
`;

const Item = ( { level, item } ) => {
	return (
		<div>
			<span>
				<ItemResult result={ item.result.toString() }>{ item.result ? __( 'Pass' ) : __( 'Fail' ) }: </ItemResult>
				{ item.name }
			</span>
			{ item.error && <ItemError>{ __( 'Message:' ) } { item.error }</ItemError> }
			<List items={ item.diagnosables } level={ level + 1 } />
		</div>
	);
};

export { Item };
export default Item;

Item.propTypes = {
	level: PropTypes.number.isRequired,
	item: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		result: PropTypes.bool.isRequired,
		error: PropTypes.string,
		diagnosables: PropTypes.arrayOf(
			PropTypes.object,
		),
	} ),
};
