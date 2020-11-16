<?php
use Elementor\Core\Utils\Version;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Those variables was declared in 'in_plugin_update_message' method that includes the current view file.
 *
 * @var Version $new_version
 * @var array $untested_extensions
 * @var string $header
 */
?>
<hr class="e-major-update-warning__separator" />
<div class="e-major-update-warning">
	<div class="e-major-update-warning__message">
		<strong>
			<?php esc_html_e( 'Compatibility Alert', 'elementor' ); ?>
		</strong> -
		<?php
		/* translators: %s: Elementor version */
		echo sprintf(
			__( 'Some of the plugins you’re using have not been tested with the latest version of Elementor (%s). To avoid issues, make sure they are all up to date and compatible before updating Elementor.', 'elementor' ),
			$new_version->__toString()
		);
		?>
	</div>
	<br />
	<table class="e-compatibility-update-table">
		<tr>
			<th><?php esc_html_e( 'Plugin', 'elementor' ); ?></th>
			<th><?php
				/* translators: %s - Elementor plugin name */
				echo sprintf( __( 'Tested up to %s version', 'elementor' ), __( 'Elementor', 'elementor' ) );
			?></th>
		</tr>
		<?php foreach ( $untested_extensions as $untested_extension ) : ?>
			<tr>
				<td><?php echo $untested_extension['Name']; ?></td>
				<td><?php echo $untested_extension[ $header ]; ?></td>
			</tr>
		<?php endforeach ?>
	</table>
</div>
