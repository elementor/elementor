import { Stack, Box, Typography, Paper } from '@elementor/ui';

export function ReExportBanner() {
	return (
		<Paper
			color="secondary"
			elevation={ 0 }
		>
			<Stack
				direction="row"
				sx={ {
					alignItems: 'center',
					gap: '5px',
					p: 2.5,
					border: 1,
					borderRadius: 1,
					borderColor: 'action.focus',
				} }
			>
				<Box component="i" className="eicon-info-circle" />
				<Typography variant="body1">
					{ __( 'This website template was exported with an older version of Elementor, so component editing is limited.', 'elementor' ) }
				</Typography>
			</Stack>
		</Paper>
	);
}
