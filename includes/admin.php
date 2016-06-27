<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Admin {

	/**
	 * Enqueue admin scripts.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_scripts() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
		wp_register_script(
			'elementor-admin-app',
			ELEMENTOR_ASSETS_URL . 'js/admin' . $suffix . '.js',
			[
				'jquery',
			],
			Plugin::instance()->get_version(),
			true
		);
		wp_enqueue_script( 'elementor-admin-app' );
	}

	/**
	 * Enqueue admin styles.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_styles() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'elementor-icons',
			ELEMENTOR_ASSETS_URL . 'lib/eicons/css/elementor-icons' . $suffix . '.css',
			[],
			Plugin::instance()->get_version()
		);

		wp_register_style(
			'elementor-admin-app',
			ELEMENTOR_ASSETS_URL . 'css/admin' . $direction_suffix . $suffix . '.css',
			[
				'elementor-icons',
			],
			Plugin::instance()->get_version()
		);

		wp_enqueue_style( 'elementor-admin-app' );
	}

	/**
	 * Print switch button in edit post (which has cpt support).
	 *
	 * @since 1.0.0
	 * @param $post
	 *
	 * @return void
	 */
	public function print_switch_mode_button( $post ) {
		if ( ! User::is_current_user_can_edit( $post->ID ) ) {
			return;
		}

		$current_mode = Plugin::instance()->db->get_edit_mode( $post->ID );
		if ( 'builder' !== $current_mode ) {
			$current_mode = 'editor';
		}

		wp_nonce_field( basename( __FILE__ ), '_elementor_edit_mode_nonce' );
		?>
		<div id="elementor-switch-mode">
			<input id="elementor-switch-mode-input" type="hidden" name="_elementor_post_mode" value="<?php echo $current_mode; ?>" />
			<button id="elementor-switch-mode-button" class="elementor-button">
				<span class="elementor-switch-mode-on"><?php _e( '&#8592; Back to WordPress Editor', 'elementor' ); ?></span>
				<span class="elementor-switch-mode-off">
					<i class="eicon-elementor"></i>
					<?php _e( 'Edit with Elementor', 'elementor' ); ?>
				</span>
			</button>
		</div>
		<div id="elementor-editor">
	        <a id="elementor-go-to-edit-page-link" href="<?php echo Utils::get_edit_link( $post->ID ); ?>">
		        <div id="elementor-editor-button" class="elementor-button">
			        <i class="eicon-elementor"></i>
					<?php _e( 'Edit with Elementor', 'elementor' ); ?>
		        </div>
		        <div id="elementor-loader-wrapper">
			        <div id="elementor-loader">
				        <div class="elementor-loader-box"></div>
				        <div class="elementor-loader-box"></div>
				        <div class="elementor-loader-box"></div>
				        <div class="elementor-loader-box"></div>
			        </div>
			        <div id="elementor-loading-title"><?php _e( 'Loading', 'elementor' ); ?></div>
		        </div>
	        </a>
		</div>
		<?php
	}

	/**
	 * Fired when the save the post, and flag the post mode.
	 *
	 * @since 1.0.0
	 * @param $post_id
	 *
	 * @return void
	 */
	public function save_post( $post_id ) {
		if ( ! isset( $_POST['_elementor_edit_mode_nonce'] ) || ! wp_verify_nonce( $_POST['_elementor_edit_mode_nonce'], basename( __FILE__ ) ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Exit when you don't have $_POST array.
		if ( empty( $_POST ) ) {
			return;
		}

		if ( ! isset( $_POST['_elementor_post_mode'] ) )
			$_POST['_elementor_post_mode'] = '';

		Plugin::instance()->db->set_edit_mode( $post_id, $_POST['_elementor_post_mode'] );
	}

	/**
	 * Add edit link in outside edit post.
	 *
	 * @since 1.0.0
	 * @param $actions
	 * @param $post
	 *
	 * @return array
	 */
	public function add_edit_in_dashboard( $actions, $post ) {
		if ( User::is_current_user_can_edit( $post->ID ) ) {
			$actions['edit_with_elementor'] = sprintf(
				'<a href="%s">%s</a>',
				Utils::get_edit_link( $post->ID ),
				__( 'Edit with Elementor', 'elementor' )
			);
		}

		return $actions;
	}

	public function body_status_classes( $classes ) {
		global $pagenow;

		if ( in_array( $pagenow, [ 'post.php', 'post-new.php' ] ) && Utils::is_post_type_support() ) {
			$post = get_post();

			$current_mode = Plugin::instance()->db->get_edit_mode( $post->ID );

			$mode_class = 'builder' === $current_mode ? 'elementor-editor-active' : 'elementor-editor-inactive';

			$classes .= ' ' . $mode_class;
		}

		return $classes;
	}

	public function plugin_action_links( $links ) {
		$settings_link = sprintf( '<a href="%s">%s</a>', admin_url( 'admin.php?page=' . Settings::PAGE_ID ), __( 'Settings', 'elementor' ) );
		array_unshift( $links, $settings_link );

		return $links;
	}

	public function admin_footer_text( $footer_text ) {
		$current_screen = get_current_screen();
		$is_elementor_screen = ( $current_screen && false !== strpos( $current_screen->base, 'elementor' ) );

		if ( $is_elementor_screen ) {
			$footer_text = sprintf( __( 'Enjoyed <strong>Elementor</strong>? Please leave us a %s rating. We really appreciate your support!', 'elementor' ), '<a href="https://wordpress.org/support/view/plugin-reviews/elementor?filter=5#postform" target="_blank">&#9733;&#9733;&#9733;&#9733;&#9733;</a>' );
		}

		return $footer_text;
	}

	/**
	 * Admin constructor.
	 */
	public function __construct() {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_styles' ] );

		add_action( 'edit_form_after_title', [ $this, 'print_switch_mode_button' ] );
		add_action( 'save_post', [ $this, 'save_post' ] );

		add_filter( 'page_row_actions', [ $this, 'add_edit_in_dashboard' ], 10, 2 );
		add_filter( 'post_row_actions', [ $this, 'add_edit_in_dashboard' ], 10, 2 );

		add_filter( 'plugin_action_links_' . ELEMENTOR_PLUGIN_BASE, [ $this, 'plugin_action_links' ] );

		add_filter( 'admin_body_class', [ $this, 'body_status_classes' ] );
		add_filter( 'admin_footer_text', [ $this, 'admin_footer_text' ] );
	}
}
