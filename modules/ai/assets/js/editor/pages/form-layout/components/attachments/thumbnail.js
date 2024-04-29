import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const THUMBNAIL_SIZE = 64;

const StyledBody = styled.body`
	html, body {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	body > * {
		width: 100% !important;
	}

	body > img {
		height: 100%;
		object-fit: cover;
	}

	body:has(> img) {
		height: ${ THUMBNAIL_SIZE }px
	}
`;

export const Thumbnail = ( props ) => {
	const dataWidth = props.html.match( 'data-width="(?<width>\\d+)"' )?.groups?.width;
	const dataHeight = props.html.match( 'data-height="(?<height>\\d+)"' )?.groups?.height;

	const width = dataWidth ? parseInt( dataWidth ) : THUMBNAIL_SIZE;
	const height = dataHeight ? parseInt( dataHeight ) : THUMBNAIL_SIZE;

	const scaleFactor = Math.min( height, width );
	const scale = THUMBNAIL_SIZE / scaleFactor;

	// Center the preview
	const top = height > width ? ( ( THUMBNAIL_SIZE - ( THUMBNAIL_SIZE * ( height / width ) ) ) / 2 ) : 0;
	const left = width > height ? ( ( THUMBNAIL_SIZE - ( THUMBNAIL_SIZE * ( width / height ) ) ) / 2 ) : 0;

	return (
		<Box
			dir="ltr"
			sx={ {
				position: 'relative',
				cursor: 'default',
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'grey.300',
				borderRadius: 1,
				boxSizing: 'border-box',
				width: THUMBNAIL_SIZE,
				height: THUMBNAIL_SIZE,
				opacity: props.disabled ? 0.5 : 1,
			} }
		>
			<iframe
				title={ __( 'Preview', 'elementor' ) }
				sandbox=""
				srcDoc={
					`<style>` +
					StyledBody.componentStyle.rules.join( '' ) +
					`</style>` +
					props.html
				}
				style={ {
					border: 'none',
					overflow: 'hidden',
					width,
					height,
					transform: `scale(${ scale })`,
					transformOrigin: `${ left }px ${ top }px`,
				} }
			/>
		</Box>
	);
};

Thumbnail.propTypes = {
	html: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
};
