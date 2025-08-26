import { Stack, Box, Typography } from '@elementor/ui';

export function ReExportBanner() {
	return (
		<Box
			sx={ {
				mb: 3,
				border: 1,
				borderRadius: 1,
				borderColor: 'action.focus',
				p: 2.5,
				backgroundColor: 'primary.main',
			} }
		>
			<Stack
				direction="row"
				sx={ { alignItems: 'center', gap: '5px' } }
			>
				<Box component="i" className="eicon-info-circle" />
				<Typography variant="body1">
					{ __( 'This website template was exported with an older version of Elementor, so component editing is limited.', 'elementor' ) }
				</Typography>
			</Stack>
		</Box>
	);
}
