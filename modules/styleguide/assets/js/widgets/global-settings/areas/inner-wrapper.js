import styled from 'styled-components';

const innerWrapper = styled.div`
  display: flex;
  align-items: center;
	width: 100%;
	max-width: 1140px;
	margin: auto;
  flex-wrap: wrap;
	flex-direction:${ ( props ) => props.flexDirection ?? 'row' };
  @media (max-width: 1140px) {
    margin-left:15px;
    margin-right:15px;
  }
  @media (max-width: 640px) {
    margin-left:13px;
    margin-right:13px;
  }
`;

export default innerWrapper;