import styled from 'styled-components';
import { Item } from './';

const Wrapper = styled.div`
  padding-${ ( { rtl } ) => 'true' === rtl ? 'right' : 'left' }: ${ ( { level } ) => level * 10 }px;
`;

const List = ( { level, items } ) => {
	return (
		<Wrapper rtl={ elementorCommon.config.isRTL } level={ level }>
			{ items.map(
				( item ) => <Item key={ item.id } level={ level } item={ item } />
			) }
		</Wrapper>
	);
};

export { List };
export default List;

List.propTypes = {
	level: PropTypes.number,
	items: PropTypes.arrayOf(
		PropTypes.object
	),
};

List.defaultProps = {
	level: 0,
	items: [],
};
