import { Box, Divider, Stack } from '@elementor/ui';

export const WhatsNewItemTopicLine = ( { topic, date } ) => {
	return (
		<Stack
			direction="row"
			divider={ <Divider orientation="vertical" flexItem /> }
			spacing={ 1 }
			color="text.tertiary"
			sx={ {
				pb: 1,
			} }
		>
			{ topic && (
				<Box>{ topic }</Box>
			) }
			{ date && (
				<Box>{ date }</Box>
			) }
		</Stack>
	);
};

WhatsNewItemTopicLine.propTypes = {
	topic: PropTypes.string,
	date: PropTypes.string,
};
