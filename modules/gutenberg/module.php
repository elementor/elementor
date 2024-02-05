<?php
namespace Elementor\Modules\Gutenberg;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	protected $is_gutenberg_editor_active = false;

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function get_name() {
		return 'gutenberg';
	}

	/**
	 * @since 2.1.0
	 * @access public
	 * @static
	 */
	public static function is_active() {
		return function_exists( 'register_block_type' );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function register_elementor_rest_field() {
		register_rest_field( get_post_types( '', 'names' ),
			'gutenberg_elementor_mode', [
				'update_callback' => function( $request_value, $object ) {
					if ( ! User::is_current_user_can_edit( $object->ID ) ) {
						return false;
					}

					$document = Plugin::$instance->documents->get( $object->ID );

					if ( ! $document ) {
						return false;
					}

					$document->set_is_built_with_elementor( false );

					return true;
				},
			]
		);
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function enqueue_assets() {
		$document = Plugin::$instance->documents->get( get_the_ID() );

		if ( ! $document || ! $document->is_editable_by_current_user() ) {
			return;
		}

		$this->is_gutenberg_editor_active = true;

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_enqueue_script( 'elementor-gutenberg', ELEMENTOR_ASSETS_URL . 'js/gutenberg' . $suffix . '.js', [ 'jquery' ], ELEMENTOR_VERSION, true );

		$elementor_settings = [
			'isElementorMode' => $document->is_built_with_elementor(),
			'editLink' => $document->get_edit_url(),
		];
		Utils::print_js_config( 'elementor-gutenberg', 'ElementorGutenbergSettings', $elementor_settings );
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function print_admin_js_template() {
		if ( ! $this->is_gutenberg_editor_active ) {
			return;
		}

		?>
		<script id="elementor-gutenberg-button-switch-mode" type="text/html">
			<div id="elementor-switch-mode">
				<button id="elementor-switch-mode-button" type="button" class="button button-primary button-large">
					<span class="elementor-switch-mode-on"><?php echo esc_html__( '&#8592; Back to WordPress Editor', 'elementor' ); ?></span>
					<span class="elementor-switch-mode-off">
						<i class="eicon-elementor-square" aria-hidden="true"></i>
						<?php echo esc_html__( 'Edit with Elementor', 'elementor' ); ?>
					</span>
				</button>
			</div>
		</script>

		<script id="elementor-gutenberg-panel" type="text/html">
			<div id="elementor-editor">
				<div id="elementor-go-to-edit-page-link">
					<button id="elementor-editor-button" class="button button-primary button-hero">
						<i class="eicon-elementor-square" aria-hidden="true"></i>
						<?php echo esc_html__( 'Edit with Elementor', 'elementor' ); ?>
					</button>
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
				</div>
			</div>
		</script>
		<?php
	}

	/**
	 * @since 2.1.0
	 * @access public
	 */
	public function __construct() {
		$this->register_experiments();

		add_action( 'rest_api_init', [ $this, 'register_elementor_rest_field' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_footer', [ $this, 'print_admin_js_template' ] );

		add_action( 'wp_enqueue_scripts', [ $this, 'dequeue_assets' ], 999 );
	}

	public function register_experiments() {
		Plugin::$instance->experiments->add_feature( [
			'name' => 'block_editor_assets_optimize',
			'title' => esc_html__( 'Optimized Gutenberg Loading', 'elementor' ),
			'description' => esc_html__( 'Use this experiment to reduce unnecessary render-blocking loads, enhancing site performance by dequeuing unused Gutenberg block editor files (styles and scripts).', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_STABLE,
			'default' => Experiments_Manager::STATE_ACTIVE,
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'generator_tag' => true,
		] );
	}

	public function dequeue_assets() {
		if ( ! Plugin::$instance->experiments->is_feature_active( 'block_editor_assets_optimize' ) ) {
			return;
		}

		if ( ! static::should_dequeue_gutenberg_assets() ) {
			return;
		}

		wp_dequeue_style( 'wp-block-library' );
		wp_dequeue_style( 'wp-block-library-theme' );
		wp_dequeue_style( 'wc-block-style' );
		wp_dequeue_style( 'wc-blocks-style' );
	}

	private static function should_dequeue_gutenberg_assets() : bool {
		$post = get_post();

		if ( empty( $post->ID ) ) {
			return false;
		}

		if ( ! static::is_built_with_elementor( $post ) ) {
			return false;
		}

		if ( static::is_gutenberg_in_post( $post ) ) {
			return false;
		}

		return true;
	}

	private static function is_built_with_elementor( $post ) : bool {
		$document = Plugin::$instance->documents->get( $post->ID );

		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return false;
		}

		return true;
	}

	private static function is_gutenberg_in_post( $post ) : bool {
		if ( has_blocks( $post ) ) {
			return true;
		}

		if ( static::current_theme_is_fse_theme() ) {
			return true;
		}

		return false;
	}

	private static function current_theme_is_fse_theme() : bool {
		if ( function_exists( 'wp_is_block_theme' ) ) {
			return (bool) wp_is_block_theme();
		}
		if ( function_exists( 'gutenberg_is_fse_theme' ) ) {
			return (bool) gutenberg_is_fse_theme();
		}

		return false;
	}
}
