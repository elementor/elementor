import styled from 'styled-components';
import DivBase from './div-base';

const innerWrapper = styled( DivBase )`
	display: flex;
	align-items: center;
	width: 100%;
	max-width: 1140px;
	margin: auto;
	flex-wrap: wrap;
	flex-direction: ${ ( props ) => props.flexDirection ?? 'row' };

	@media (max-width: 1140px) {
		padding: 0 15px;
	}

	@media (max-width: 767px) {
		padding: 0 13px;
	}
`;

export default innerWrapper;
