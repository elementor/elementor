<?php
use Elementor\Core\Utils\Version;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\CompatibilityTag\Base_Module;
use Elementor\Modules\CompatibilityTag\Compatibility_Tag;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Those variables were declared in 'in_plugin_update_message' method that included the current view file.
 *
 * @var Base_Module $this
 * @var Version $new_version
 * @var Collection $plugins
 * @var array $plugins_compatibility
 */
?>
<hr class="e-major-update-warning__separator" />
<div class="e-major-update-warning">
	<div class="e-major-update-warning__icon">
		<i class="eicon-info-circle"></i>
	</div>
	<div>
		<div class="e-major-update-warning__message">
			<strong>
				<?php echo __( 'Compatibility Alert', 'elementor' ); ?>
			</strong> -
			<?php
			/* translators: %1$s: Plugin name %s: Plugin version */
			echo sprintf(
				__( 'Some of the plugins you’re using have not been tested with the latest version of %1$s (%2$s). To avoid issues, make sure they are all up to date and compatible before updating %1$s.', 'elementor' ),
				$this->get_plugin_label(),
				$new_version->__toString()
			);
			?>
		</div>
		<br />
		<table class="e-compatibility-update-table">
			<tr>
				<th><?php echo __( 'Plugin', 'elementor' ); ?></th>
				<th><?php
					/* translators: %s - Elementor plugin name */
					echo sprintf( __( 'Tested up to %s version', 'elementor' ), $this->get_plugin_label() );
				?></th>
			</tr>
			<?php foreach ( $plugins as $plugin_name => $plugin_data ) : ?>
				<?php
				if (
				in_array( $plugins_compatibility[ $plugin_name ], [
					Compatibility_Tag::PLUGIN_NOT_EXISTS,
					Compatibility_Tag::HEADER_NOT_EXISTS,
					Compatibility_Tag::INVALID_VERSION,
				], true )
				) {
					$plugin_data[ $this->get_plugin_header() ] = __( 'Unknown', 'elementor' );
				}
				?>

				<tr>
					<td><?php echo $plugin_data['Name']; ?></td>
					<td><?php echo $plugin_data[ $this->get_plugin_header() ]; ?></td>
				</tr>
			<?php endforeach ?>
		</table>
	</div>
</div>
