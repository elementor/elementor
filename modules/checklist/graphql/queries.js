import { gql } from '@apollo/client';

export const GET_CHECKLIST = gql`
query{
  checklistSteps {
    edges {
      node {
        title
        content
        checklistStepCpt{
	   		learnMoreUrl
          	stepImage {
           		node {
              		sourceUrl
            	}
          	}
		}
      }
    }
  }
}
`;
