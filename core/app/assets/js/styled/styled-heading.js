import styled, {css, createGlobalStyle } from 'styled-components';
import _$ from 'elementor-app/styled/utils';

//document.querySelector( 'html' ).setAttribute( 'dir', 'rtl' );

const GlobalStyle = createGlobalStyle`
.eps-heading {
  text-decoration: underline;
  color: pink;
}
.eps-heading--h1 {
  font-size: 70px;
  color: #fcb92c;
  line-height: 70px;
}
@media screen and (max-width: 960px) {
  .eps-heading--h1 {
    color: grey;
  }
}
.eps-heading--h2 {
  font-size: 60px;
  color: #58d0f5;
  line-height: 60px;
}
@media screen and (max-width: 960px) {
  .eps-heading {
    color: orange;
  }
}

.eps-theme-dark .eps-heading--h1 {
  color: pink;
}

:not([dir=rtl]) .eps-heading--h1 {
  left: 90px;
}

[dir=rtl] .eps-heading--h1 {
  right: 90px;
}

.eps-text--xs {
  font-size: 10px;
}
.eps-text--sm {
  font-size: 11px;
}
.eps-text--md {
  font-size: 12px;
}
.eps-text--lg {
  font-size: 13px;
}
.eps-text--xl {
  font-size: 14px;
}

.eps-button {
  display: inline-flex;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
}
.eps-button--variant-contained {
  padding: 30px;
  border-radius: 5px;
}
.eps-button--variant-outlined {
  text-decoration: underline;
}
.eps-button--color-primary {
  background-color: #39b54a;
}
.eps-button--color-secondary {
  background-color: #58d0f5;
}
`;

const Heading = styled.h1`
	color: green;
	${ props => {
		return false;
		return _$.utils.bindVariant( 'Heading', props.variant );
	} }
`;

console.log( '### Heading', Heading );

export const StyledHeading = ( props ) => (
	<>
		<GlobalStyle />
		<Heading { ...props } className="eps-heading--h1"  as={ props.tag }>{ props.children }</Heading>
	</>
);

StyledHeading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
};

StyledHeading.defaultProps = {
	className: '',
};
