<?php

namespace Elementor\Modules\WcProductEditor;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function __construct() {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_footer', [ $this, 'print_button_js_template' ] );
	}

	public static function is_active() {
		return self::is_new_woocommerce_product_editor_page();
	}

	public function enqueue_assets() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_enqueue_script(
			'elementor-wc-product-editor',
			ELEMENTOR_ASSETS_URL . 'js/wc-product-editor' . $suffix . '.js',
			[],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_style(
			'elementor-wc-product-editor',
			ELEMENTOR_ASSETS_URL . 'css/wc-product-editor' . $suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);
	}

	public function get_name() {
		return 'wc-product-editor';
	}

	public static function is_new_woocommerce_product_editor_page() {
		$page = Utils::get_super_global_value( $_GET, 'page' );
		$path = Utils::get_super_global_value( $_GET, 'path' );

		if ( ! isset( $page ) || 'wc-admin' !== $page || ! isset( $path ) ) {
			return false;
		}

		$path_pieces = explode( '/', $path );
		$route       = $path_pieces[1];

		return 'product' === $route;
	}

	public function print_button_js_template() {
		$post_id = $this->get_post_id();
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return;
		}
		?>
		<script id="elementor-woocommerce-new-editor-button" type="text/html">
			<a id="elementor-go-to-edit-page-link" class="elementor-wc-button-wrapper" href="<?php echo esc_url( $document->get_edit_url() ); ?>">
				<div id="elementor-editor-button" class="button button-primary button-large">
					<i class="eicon-elementor-square" aria-hidden="true"></i>
					<?php echo esc_html__( 'Edit with Elementor', 'elementor' ); ?>
				</div>
				<div class="elementor-loader-wrapper">
					<div class="elementor-loader">
						<div class="elementor-loader-boxes">
							<div class="elementor-loader-box"></div>
							<div class="elementor-loader-box"></div>
							<div class="elementor-loader-box"></div>
							<div class="elementor-loader-box"></div>
						</div>
					</div>
					<div class="elementor-loading-title"><?php echo esc_html__( 'Loading', 'elementor' ); ?></div>
				</div>
			</a>
		</script>
		<?php
	}

	private function get_post_id() {
		if ( Utils::get_super_global_value( $_GET, 'path' ) === null ) {
			return false;
		}

		$path_query = Utils::get_super_global_value( $_GET, 'path' );
		$query_string = isset( $path_query ) ? explode( '/', $path_query ) : [];

		return (int) end( $query_string );
	}
}
