<?php
namespace Elementor\Modules\Gutenberg;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	protected $is_gutenberg_editor_active = false;

	public function get_name() {
		return 'gutenberg';
	}

	public static function is_active() {
		return function_exists( 'the_gutenberg_project' );
	}

	public function register_elementor_rest_field() {
		register_rest_field( get_post_types( '', 'names' ),
			'gutenberg_elementor_mode', [
				'update_callback' => function( $request_value, $object ) {
					if ( ! User::is_current_user_can_edit( $object->ID ) ) {
						return false;
					}

					Plugin::$instance->db->set_is_elementor_page( $object->ID, false );

					return true;
				},
			]
		);
	}

	public function enqueue_assets() {
		$post_id = get_the_ID();

		if ( ! User::is_current_user_can_edit( $post_id ) ) {
			return;
		}

		$this->is_gutenberg_editor_active = true;

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_enqueue_script( 'elementor-gutenberg', ELEMENTOR_ASSETS_URL . 'js/gutenberg' . $suffix . '.js', [ 'jquery' ], ELEMENTOR_VERSION, true );

		$elementor_settings = [
			'isElementorMode' => Plugin::$instance->db->is_built_with_elementor( $post_id ),
			'editLink' => Utils::get_edit_link( $post_id ),
		];

		wp_localize_script( 'elementor-gutenberg', 'ElementorGutenbergSettings', $elementor_settings );
	}

	public function print_admin_js_template() {
		if ( ! $this->is_gutenberg_editor_active ) {
			return;
		}

		?>
		<script id="elementor-gutenberg-button-switch-mode" type="text/html">
			<div id="elementor-switch-mode">
				<button id="elementor-switch-mode-button" type="button" class="button button-primary button-large">
					<span class="elementor-switch-mode-on"><?php echo __( '&#8592; Back to WordPress Editor', 'elementor' ); ?></span>
					<span class="elementor-switch-mode-off">
						<i class="eicon-elementor-square" aria-hidden="true"></i>
						<?php echo __( 'Edit with Elementor', 'elementor' ); ?>
					</span>
				</button>
			</div>
		</script>

		<script id="elementor-gutenberg-panel" type="text/html">
			<div id="elementor-editor"><a id="elementor-go-to-edit-page-link" href="#">
					<div id="elementor-editor-button" class="button button-primary button-hero">
						<i class="eicon-elementor-square" aria-hidden="true"></i>
						<?php echo __( 'Edit with Elementor', 'elementor' ); ?>
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
						<div class="elementor-loading-title"><?php echo __( 'Loading', 'elementor' ); ?></div>
					</div>
				</a></div>
		</script>
		<?php
	}

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_elementor_rest_field' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_footer', [ $this, 'print_admin_js_template' ] );
	}
}
