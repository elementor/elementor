import * as React from 'react';
import { type ElementNode, getAtomicStringSetting } from '@elementor/editor-v5-store';
import { Box, Button, Typography } from '@elementor/ui';

type ElementPreviewProps = {
	element: ElementNode;
};

const WIDGET_PREVIEW_MIN_HEIGHT = 48;

function HeadingPreview( { element }: ElementPreviewProps ) {
	const title = getAtomicStringSetting( element.settings, 'title' ) || 'Add Your Heading Text Here';

	return (
		<Typography sx={ { fontSize: 32, fontWeight: 700, lineHeight: 1.2 } } variant="h4">
			{ title }
		</Typography>
	);
}

function ParagraphPreview( { element }: ElementPreviewProps ) {
	const text =
		getAtomicStringSetting( element.settings, 'paragraph' ) ||
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.';

	return (
		<Typography color="text.secondary" sx={ { lineHeight: 1.6 } } variant="body1">
			{ text }
		</Typography>
	);
}

function ButtonPreview( { element }: ElementPreviewProps ) {
	const label = getAtomicStringSetting( element.settings, 'text' ) || 'Click here';

	return (
		<Button size="medium" variant="contained">
			{ label }
		</Button>
	);
}

function ImagePreview() {
	return (
		<Box
			sx={ {
				alignItems: 'center',
				backgroundColor: 'grey.100',
				border: '1px dashed',
				borderColor: 'grey.300',
				borderRadius: 1,
				color: 'text.secondary',
				display: 'flex',
				justifyContent: 'center',
				minHeight: 180,
			} }
		>
			<Typography variant="body2">Image</Typography>
		</Box>
	);
}

function DividerPreview() {
	return <Box sx={ { borderTop: '2px solid', borderColor: 'grey.300', my: 1 } } />;
}

function ContainerPreview( { element }: ElementPreviewProps ) {
	const children = element.elements ?? [];

	if ( ! children.length ) {
		return (
			<Box
				sx={ {
					alignItems: 'center',
					border: '1px dashed',
					borderColor: 'grey.300',
					borderRadius: 1,
					color: 'text.secondary',
					display: 'flex',
					justifyContent: 'center',
					minHeight: WIDGET_PREVIEW_MIN_HEIGHT,
					py: 3,
				} }
			>
				<Typography variant="caption">Drop elements here</Typography>
			</Box>
		);
	}

	return null;
}

function GenericPreview( { element }: ElementPreviewProps ) {
	return (
		<Box
			sx={ {
				alignItems: 'center',
				backgroundColor: 'grey.50',
				borderRadius: 1,
				display: 'flex',
				justifyContent: 'center',
				minHeight: WIDGET_PREVIEW_MIN_HEIGHT,
				px: 2,
				py: 1.5,
			} }
		>
			<Typography color="text.secondary" variant="body2">
				{ element.widgetType || element.elType }
			</Typography>
		</Box>
	);
}

export default function ElementPreview( { element }: ElementPreviewProps ) {
	const widgetType = element.widgetType ?? element.elType;

	switch ( widgetType ) {
		case 'e-heading':
			return <HeadingPreview element={ element } />;
		case 'e-paragraph':
			return <ParagraphPreview element={ element } />;
		case 'e-button':
			return <ButtonPreview element={ element } />;
		case 'e-image':
			return <ImagePreview />;
		case 'e-divider':
			return <DividerPreview />;
		case 'e-flexbox':
		case 'e-div-block':
		case 'e-grid':
			return <ContainerPreview element={ element } />;
		default:
			return <GenericPreview element={ element } />;
	}
}
