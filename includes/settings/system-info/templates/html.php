<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @var array $reports
 */
foreach ( $reports as $report_name => $report ) : ?>
	<div class="elementor-system-info-section elementor-system-info-<?php echo esc_attr( $report_name ); ?>">
		<table class="widefat">
			<thead>
			<tr>
				<th><?php echo $report['label']; ?></th>
				<th></th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			<?php
			foreach ( $report['report'] as $field_name => $field ) :
				if ( in_array( $report_name, [ 'plugins', 'network_plugins', 'mu_plugins' ], true ) ) {
					foreach ( $field['value'] as $plugin_info ) :
						?>
						<tr>
							<td><?php
							if ( $plugin_info['PluginURI'] ) :
								$plugin_name = "<a href='{$plugin_info['PluginURI']}'>{$plugin_info['Name']}</a>";
							else :
								$plugin_name = $plugin_info['Name'];
							endif;

							if ( $plugin_info['Version'] ) :
								$plugin_name .= ' - ' . $plugin_info['Version'];
							endif;

							echo $plugin_name;
							?></td>
							<td><?php
							if ( $plugin_info['Author'] ) :
								if ( $plugin_info['AuthorURI'] ) :
									$author = "<a href='{$plugin_info['AuthorURI']}'>{$plugin_info['Author']}</a>";
								else :
									$author = $plugin_info['Author'];
								endif;

								echo "By $author";
							endif;
							?></td>
							<td></td>
						</tr>
						<?php
					endforeach;
				} else {
					$warning_class = ! empty( $field['warning'] ) ? ' class="elementor-warning"' : '';
					$log_label = ! empty( $field['label'] ) ? $field['label'] . ':' : '';
					?>
					<tr<?php echo $warning_class; ?>>
						<td><?php echo $log_label; ?></td>
						<td><?php echo $field['value']; ?></td>
						<td><?php
						if ( ! empty( $field['recommendation'] ) ) :
							echo $field['recommendation'];
						endif;
						?></td>
					</tr>
					<?php
				}
			endforeach;
			?>
			</tbody>
		</table>
	</div>
	<?php
endforeach;
