<?php
namespace Elementor\Modules\NewElementorPage;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'new-elementor-page';
	}

	public function __construct() {
		parent::__construct();
		add_action( 'admin_head', array( $this, 'add_elementor_page_button' ) );
		add_action( 'wp_ajax_create_elementor_page', array( $this, 'create_elementor_page' ) );
		add_action( 'wp_ajax_nopriv_create_elementor_page', array( $this, 'create_elementor_page' ) );
	}

	public function add_elementor_page_button() {
		global $pagenow;

		if ( 'edit.php' === $pagenow && get_current_screen()->post_type === 'page' ) {
			?>
			<script>
				jQuery(document).ready(function($) {
					var $button = $('<a id="e-new-page" href="#" class="page-title-action"><?php esc_attr_e( 'New Elementor Page', 'elementor' ); ?></a>');
					$('.wrap > h1').after($button);
					$button.on('click', function(e) {
						e.preventDefault();
						$.ajax({
							url: '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>',
							type: 'POST',
							data: {
								action: 'create_elementor_page',
							},
							success: function(response) {
								if (response.success && response.data?.post_id) {
									window.location.href = '<?php echo esc_url( admin_url( 'post.php?action=elementor' ) ); ?>&post=' + response.data.post_id;
								}
							},
							error: function(jqXHR, textStatus, errorThrown) {
								console.error(textStatus, errorThrown);
							}
						});
					});
				});
			</script>
			<?php
		}
	}

	public function create_elementor_page() {
		$post_id = wp_insert_post( array(
			'post_title' => 'New Elementor Page',
			'post_type' => 'page',
			'post_status' => 'draft',
		) );

		if ( $post_id ) {
			wp_send_json_success( array(
				'post_id' => $post_id,
			) );
		} else {
			wp_send_json_error( 'Failed to create new page.' );
		}
	}

}
