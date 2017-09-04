<?php
namespace Elementor;

use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor {

	private $_post_id;

	private $_is_edit_mode;

	private $_editor_templates = [];

	public function init( $die = true ) {
		if ( empty( $_REQUEST['post'] ) ) { // WPCS: CSRF ok.
			return;
		}

		$this->_post_id = absint( $_REQUEST['post'] );

		if ( ! $this->is_edit_mode( $this->_post_id ) ) {
			return;
		}

		$this->init_editor_templates();

		// Send MIME Type header like WP admin-header.
		@header( 'Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option( 'blog_charset' ) );

		query_posts( [ 'p' => $this->_post_id, 'post_type' => get_post_type( $this->_post_id ) ] );

		Plugin::$instance->db->switch_to_post( $this->_post_id );

		add_filter( 'show_admin_bar', '__return_false' );

		// Remove all WordPress actions
		remove_all_actions( 'wp_head' );
		remove_all_actions( 'wp_print_styles' );
		remove_all_actions( 'wp_print_head_scripts' );
		remove_all_actions( 'wp_footer' );

		// Handle `wp_head`
		add_action( 'wp_head', 'wp_enqueue_scripts', 1 );
		add_action( 'wp_head', 'wp_print_styles', 8 );
		add_action( 'wp_head', 'wp_print_head_scripts', 9 );
		add_action( 'wp_head', 'wp_site_icon' );
		add_action( 'wp_head', [ $this, 'editor_head_trigger' ], 30 );

		// Handle `wp_footer`
		add_action( 'wp_footer', 'wp_print_footer_scripts', 20 );
		add_action( 'wp_footer', 'wp_auth_check_html', 30 );
		add_action( 'wp_footer', [ $this, 'wp_footer' ] );

		// Handle `wp_enqueue_scripts`
		remove_all_actions( 'wp_enqueue_scripts' );

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ], 999999 );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ], 999999 );

		// Change mode to Builder
		Plugin::$instance->db->set_is_elementor_page( $this->_post_id );

		// Post Lock
		if ( ! $this->get_locked_user( $this->_post_id ) ) {
			$this->lock_post( $this->_post_id );
		}

		// Setup default heartbeat options
		add_filter( 'heartbeat_settings', function( $settings ) {
			$settings['interval'] = 15;
			return $settings;
		} );

		// Tell to WP Cache plugins do not cache this request.
		Utils::do_not_cache();

		// Print the panel
		$this->print_panel_html();

		// From the action it's an empty string, from tests its `false`
		if ( false !== $die ) {
			die;
		}
	}

	public function redirect_to_new_url() {
		if ( ! isset( $_GET['elementor'] ) ) {
			return;
		}

		$post_id = get_the_ID();

		if ( ! User::is_current_user_can_edit( $post_id ) || ! Plugin::$instance->db->is_built_with_elementor( $post_id ) ) {
			return;
		}

		wp_redirect( Utils::get_edit_link( $post_id ) );
		die;
	}

	public function is_edit_mode( $post_id = null ) {
		if ( null !== $this->_is_edit_mode ) {
			return $this->_is_edit_mode;
		}

		if ( ! User::is_current_user_can_edit( $post_id ) ) {
			return false;
		}

		// Ajax request as Editor mode
		$actions = [
			'elementor',
			'elementor_render_widget',

			// Templates
			'elementor_get_templates',
			'elementor_save_template',
			'elementor_get_template',
			'elementor_delete_template',
			'elementor_export_template',
			'elementor_import_template',
		];

		if ( isset( $_REQUEST['action'] ) && in_array( $_REQUEST['action'], $actions ) ) {
			return true;
		}

		return false;
	}

	/**
	 * @param $post_id
	 */
	public function lock_post( $post_id ) {
		if ( ! function_exists( 'wp_set_post_lock' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/post.php' );
		}

		wp_set_post_lock( $post_id );
	}

	/**
	 * @param $post_id
	 *
	 * @return bool|\WP_User
	 */
	public function get_locked_user( $post_id ) {
		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/post.php' );
		}

		$locked_user = wp_check_post_lock( $post_id );
		if ( ! $locked_user ) {
			return false;
		}

		return get_user_by( 'id', $locked_user );
	}

	public function print_panel_html() {
		include( 'editor-templates/editor-wrapper.php' );
	}

	public function enqueue_scripts() {
		remove_action( 'wp_enqueue_scripts', [ $this, __FUNCTION__ ], 999999 );

		global $wp_styles, $wp_scripts;

		// Set the global data like $authordata and etc
		setup_postdata( $this->_post_id );

		$plugin = Plugin::$instance;

		$editor_data = $plugin->db->get_builder( $this->_post_id, DB::STATUS_DRAFT );

		// Reset global variable
		$wp_styles = new \WP_Styles();
		$wp_scripts = new \WP_Scripts();

		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) ? '' : '.min';

		// Hack for waypoint with editor mode.
		wp_register_script(
			'elementor-waypoints',
			ELEMENTOR_ASSETS_URL . 'lib/waypoints/waypoints-for-editor.js',
			[
				'jquery',
			],
			'4.0.2',
			true
		);

		wp_register_script(
			'backbone-marionette',
			ELEMENTOR_ASSETS_URL . 'lib/backbone/backbone.marionette' . $suffix . '.js',
			[
				'backbone',
			],
			'2.4.5',
			true
		);

		wp_register_script(
			'backbone-radio',
			ELEMENTOR_ASSETS_URL . 'lib/backbone/backbone.radio' . $suffix . '.js',
			[
				'backbone',
			],
			'1.0.4',
			true
		);

		wp_register_script(
			'perfect-scrollbar',
			ELEMENTOR_ASSETS_URL . 'lib/perfect-scrollbar/perfect-scrollbar.jquery' . $suffix . '.js',
			[
				'jquery',
			],
			'0.6.12',
			true
		);

		wp_register_script(
			'jquery-easing',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-easing/jquery-easing' . $suffix . '.js',
			[
				'jquery',
			],
			'1.3.2',
			true
		);

		wp_register_script(
			'nprogress',
			ELEMENTOR_ASSETS_URL . 'lib/nprogress/nprogress' . $suffix . '.js',
			[],
			'0.2.0',
			true
		);

		wp_register_script(
			'tipsy',
			ELEMENTOR_ASSETS_URL . 'lib/tipsy/tipsy' . $suffix . '.js',
			[
				'jquery',
			],
			'1.0.0',
			true
		);

		wp_register_script(
			'jquery-select2',
			ELEMENTOR_ASSETS_URL . 'lib/select2/js/select2' . $suffix . '.js',
			[
				'jquery',
			],
			'4.0.2',
			true
		);

		wp_register_script(
			'jquery-simple-dtpicker',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-simple-dtpicker/jquery.simple-dtpicker' . $suffix . '.js',
			[
				'jquery',
			],
			'1.12.0',
			true
		);

		wp_register_script(
			'ace',
			'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js',
			[],
			'1.2.5',
			true
		);

		wp_register_script(
			'jquery-hover-intent',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-hover-intent/jquery-hover-intent' . $suffix . '.js',
			[],
			'1.0.0',
			true
		);

		wp_register_script(
			'elementor-dialog',
			ELEMENTOR_ASSETS_URL . 'lib/dialog/dialog' . $suffix . '.js',
			[
				'jquery-ui-position',
			],
			'3.2.4',
			true
		);

		wp_register_script(
			'elementor-editor',
			ELEMENTOR_ASSETS_URL . 'js/editor' . $suffix . '.js',
			[
				'wp-auth-check',
				'jquery-ui-sortable',
				'jquery-ui-resizable',
				'backbone-marionette',
				'backbone-radio',
				'perfect-scrollbar',
				'nprogress',
				'tipsy',
				'imagesloaded',
				'heartbeat',
				'jquery-select2',
				'jquery-simple-dtpicker',
				'elementor-dialog',
				'ace',
				'jquery-hover-intent',
			],
			ELEMENTOR_VERSION,
			true
		);

		do_action( 'elementor/editor/before_enqueue_scripts' );

		// Remove all TinyMCE plugins.
		remove_all_filters( 'mce_buttons', 10 );
		remove_all_filters( 'mce_external_plugins', 10 );

		wp_enqueue_script( 'elementor-editor' );

		// Tweak for WP Admin menu icons
		wp_print_styles( 'editor-buttons' );

		$locked_user = $this->get_locked_user( $this->_post_id );

		if ( $locked_user ) {
			$locked_user = $locked_user->display_name;
		}

		$page_title_selector = get_option( 'elementor_page_title_selector' );

		if ( empty( $page_title_selector ) ) {
			$page_title_selector = 'h1.entry-title';
		}

		$config = [
			'version' => ELEMENTOR_VERSION,
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
			'home_url' => home_url(),
			'nonce' => wp_create_nonce( 'elementor-editing' ),
			'preview_link' => Utils::get_preview_url( $this->_post_id ),
			'elements_categories' => $plugin->elements_manager->get_categories(),
			'controls' => $plugin->controls_manager->get_controls_data(),
			'elements' => $plugin->elements_manager->get_element_types_config(),
			'widgets' => $plugin->widgets_manager->get_widget_types_config(),
			'schemes' => [
				'items' => $plugin->schemes_manager->get_registered_schemes_data(),
				'enabled_schemes' => Schemes_Manager::get_enabled_schemes(),
			],
			'default_schemes' => $plugin->schemes_manager->get_schemes_defaults(),
			'settings' => SettingsManager::get_settings_managers_config(),
			'system_schemes' => $plugin->schemes_manager->get_system_schemes(),
			'wp_editor' => $this->_get_wp_editor_config(),
			'post_id' => $this->_post_id,
			'settings_page_link' => Settings::get_url(),
			'elementor_site' => 'https://go.elementor.com/about-elementor/',
			'docs_elementor_site' => 'https://go.elementor.com/docs/',
			'help_the_content_url' => 'https://go.elementor.com/the-content-missing/',
			'assets_url' => ELEMENTOR_ASSETS_URL,
			'data' => $editor_data,
			'locked_user' => $locked_user,
			'is_rtl' => is_rtl(),
			'locale' => get_locale(),
			'viewportBreakpoints' => Responsive::get_breakpoints(),
			'rich_editing_enabled' => filter_var( get_user_meta( get_current_user_id(), 'rich_editing', true ), FILTER_VALIDATE_BOOLEAN ),
			'page_title_selector' => $page_title_selector,
			'tinymceHasCustomConfig' => class_exists( 'Tinymce_Advanced' ),
			'i18n' => [
				'elementor' => __( 'Elementor', 'elementor' ),
				'dialog_confirm_delete' => __( 'Are you sure you want to remove this {0}?', 'elementor' ),
				'dialog_user_taken_over' => __( '{0} has taken over and is currently editing. Do you want to take over this page editing?', 'elementor' ),
				'delete' => __( 'Delete', 'elementor' ),
				'cancel' => __( 'Cancel', 'elementor' ),
				'delete_element' => __( 'Delete {0}', 'elementor' ),
				'take_over' => __( 'Take Over', 'elementor' ),
				'go_back' => __( 'Go Back', 'elementor' ),
				'saved' => __( 'Saved', 'elementor' ),
				'before_unload_alert' => __( 'Please note: All unsaved changes will be lost.', 'elementor' ),
				'edit_element' => __( 'Edit {0}', 'elementor' ),
				'global_colors' => __( 'Global Colors', 'elementor' ),
				'global_fonts' => __( 'Global Fonts', 'elementor' ),
				'elementor_settings' => __( 'Elementor Settings', 'elementor' ),
				'soon' => __( 'Soon', 'elementor' ),
				'elementor_docs' => __( 'Documentation', 'elementor' ),
				'about_elementor' => __( 'About Elementor', 'elementor' ),
				'inner_section' => __( 'Columns', 'elementor' ),
				'dialog_confirm_gallery_delete' => __( 'Are you sure you want to reset this gallery?', 'elementor' ),
				'delete_gallery' => __( 'Reset Gallery', 'elementor' ),
				'gallery_images_selected' => __( '{0} Images Selected', 'elementor' ),
				'insert_media' => __( 'Insert Media', 'elementor' ),
				'preview_el_not_found_header' => __( 'Sorry, the content area was not found in your page.', 'elementor' ),
				'preview_el_not_found_message' => __( 'You must call \'the_content\' function in the current template, in order for Elementor to work on this page.', 'elementor' ),
				'learn_more' => __( 'Learn More', 'elementor' ),
				'an_error_occurred' => __( 'An error occurred', 'elementor' ),
				'templates_request_error' => __( 'The following error(s) occurred while processing the request:', 'elementor' ),
				'save_your_template' => __( 'Save Your {0} to Library', 'elementor' ),
				'save_your_template_description' => __( 'Your designs will be available for export and reuse on any page or website', 'elementor' ),
				'page' => __( 'Page', 'elementor' ),
				'section' => __( 'Section', 'elementor' ),
				'delete_template' => __( 'Delete Template', 'elementor' ),
				'delete_template_confirm' => __( 'Are you sure you want to delete this template?', 'elementor' ),
				'color_picker' => __( 'Color Picker', 'elementor' ),
				'clear_page' => __( 'Delete All Content', 'elementor' ),
				'dialog_confirm_clear_page' => __( 'Attention! We are going to DELETE ALL CONTENT from this page. Are you sure you want to do that?', 'elementor' ),
				'asc' => __( 'Ascending order', 'elementor' ),
				'desc' => __( 'Descending order', 'elementor' ),
				'autosave' => __( 'Autosave', 'elementor' ),
				'preview' => __( 'Preview', 'elementor' ),
				'back_to_editor' => __( 'Back to Editor', 'elementor' ),
				'import_template_dialog_header' => __( 'Import Page Settings', 'elementor' ),
				'import_template_dialog_message' => __( 'Do you want to also import the page settings of the template?', 'elementor' ),
				'import_template_dialog_message_attention' => __( 'Attention! Importing may override previous settings.', 'elementor' ),
				'no' => __( 'No', 'elementor' ),
				'yes' => __( 'Yes', 'elementor' ),
			],
		];

		$localized_settings = apply_filters( 'elementor/editor/localize_settings', [], $this->_post_id );

		if ( ! empty( $localized_settings ) ) {
			$config = array_replace_recursive( $config, $localized_settings );
		}

		echo '<script type="text/javascript">' . PHP_EOL;
		echo '/* <![CDATA[ */' . PHP_EOL;
		$config_json = wp_json_encode( $config );
		unset( $config );

		if ( get_option( 'elementor_editor_break_lines' ) ) {
			// Add new lines to avoid memory limits in some hosting servers that handles th buffer output according to new line characters
			$config_json = str_replace( '}},"', '}},' . PHP_EOL . '"', $config_json );
		}

		echo 'var ElementorConfig = ' . $config_json . ';' . PHP_EOL;
		echo '/* ]]> */' . PHP_EOL;
		echo '</script>';

		$plugin->controls_manager->enqueue_control_scripts();

		do_action( 'elementor/editor/after_enqueue_scripts' );
	}

	public function enqueue_styles() {
		do_action( 'elementor/editor/before_enqueue_styles' );

		$suffix = Utils::is_script_debug() ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'font-awesome',
			ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/font-awesome' . $suffix . '.css',
			[],
			'4.7.0'
		);

		wp_register_style(
			'select2',
			ELEMENTOR_ASSETS_URL . 'lib/select2/css/select2' . $suffix . '.css',
			[],
			'4.0.2'
		);

		wp_register_style(
			'elementor-icons',
			ELEMENTOR_ASSETS_URL . 'lib/eicons/css/elementor-icons' . $suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'google-font-roboto',
			'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'jquery-simple-dtpicker',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-simple-dtpicker/jquery.simple-dtpicker' . $suffix . '.css',
			[],
			'1.12.0'
		);

		wp_register_style(
			'elementor-editor',
			ELEMENTOR_ASSETS_URL . 'css/editor' . $direction_suffix . $suffix . '.css',
			[
				'font-awesome',
				'select2',
				'elementor-icons',
				'wp-auth-check',
				'google-font-roboto',
				'jquery-simple-dtpicker',
			],
			ELEMENTOR_VERSION
		);

		wp_enqueue_style( 'elementor-editor' );

		do_action( 'elementor/editor/after_enqueue_styles' );
	}

	protected function _get_wp_editor_config() {
		ob_start();
		wp_editor(
			'%%EDITORCONTENT%%',
			'elementorwpeditor',
			[
				'editor_class' => 'elementor-wp-editor',
				'editor_height' => 250,
				'drag_drop_upload' => true,
			]
		);
		return ob_get_clean();
	}

	public function editor_head_trigger() {
		do_action( 'elementor/editor/wp_head' );
	}

	/**
	 * @param string $template_path - Can be either a link to template file or template HTML content
	 */
	public function add_editor_template( $template_path ) {
		$this->_editor_templates[] = $template_path;
	}

	public function wp_footer() {
		$plugin = Plugin::$instance;

		$plugin->controls_manager->render_controls();
		$plugin->widgets_manager->render_widgets_content();
		$plugin->elements_manager->render_elements_content();

		$plugin->schemes_manager->print_schemes_templates();

		foreach ( $this->_editor_templates as $editor_template ) {
			if ( file_exists( $editor_template ) ) {
				include $editor_template;
			} else {
				echo $editor_template;
			}
		}

		do_action( 'elementor/editor/footer' );
	}

	/**
	 * @param bool $edit_mode
	 */
	public function set_edit_mode( $edit_mode ) {
		$this->_is_edit_mode = $edit_mode;
	}

	public function __construct() {
		add_action( 'admin_action_elementor', [ $this, 'init' ] );
		add_action( 'template_redirect', [ $this, 'redirect_to_new_url' ] );
	}

	private function init_editor_templates() {
		// It can be filled from plugins
		$this->_editor_templates = array_merge( $this->_editor_templates, [
		 	__DIR__ . '/editor-templates/global.php',
			__DIR__ . '/editor-templates/panel.php',
			__DIR__ . '/editor-templates/panel-elements.php',
			__DIR__ . '/editor-templates/repeater.php',
			__DIR__ . '/editor-templates/templates.php',
		] );
	}
}
