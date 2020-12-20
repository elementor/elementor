<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @var int $post_id
 * @var boolean $is_permanently_delete
 */

$config_url = add_query_arg(
	[ 'force_delete_kit' => '1' ],
	get_delete_post_link( $post_id, '', $is_permanently_delete )
);
?>

<?php
if ( $is_permanently_delete ) {
	echo __( 'If you delete this template, all associated global settings, typography and colors will be deleted', 'elementor' );
} else {
	echo __( 'If you move this template to trash, all associated global settings, typography and colors will be deleted', 'elementor' );
}
?>

<br><br>
<a class="button" href="<?php echo $config_url; ?>">
	<?php
	if ( $is_permanently_delete ) {
		echo __( 'Confirm delete', 'elementor' );
	} else {
		echo __( 'Confirm trash', 'elementor' );
	}
	?>
</a>
<a class="button" href="javascript:history.back()"> <?php echo __( 'Cancel', 'elementor' ); ?> </a>
