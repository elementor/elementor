<?php
namespace Elementor;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Tools {

	const PAGE_ID = 'elementor-tools';

	public static function get_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID );
	}

	public function register_admin_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			__( 'Tools', 'elementor' ),
			__( 'Tools', 'elementor' ),
			'manage_options',
			self::PAGE_ID,
			[ $this, 'display_settings_page' ]
		);
	}

	public function register_settings_fields() {
		$controls_class_name = __NAMESPACE__ . '\Settings_Controls';
		$validations_class_name = __NAMESPACE__ . '\Settings_Validations';

		$tools_section = 'elementor_tools_section';
		add_settings_section(
			$tools_section,
			'',
			'__return_empty_string', // No need intro text for this section right now
			self::PAGE_ID
		);

		$field_id = 'elementor_clear_cache';
		add_settings_field(
			$field_id,
			__( 'Regenerate CSS', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$tools_section,
			[
				'id' => $field_id,
				'type' => 'raw_html',
				'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-clear-cache-button">%s</button>', wp_create_nonce( 'elementor_clear_cache' ), __( 'Regenerate Files', 'elementor' ) ),
				'desc' => __( 'Styles set in Elementor are saved in CSS files in the uploads folder. Recreate those files, according to the most recent settings.', 'elementor' ),
			]
		);

		$field_id = 'elementor_raw_reset_api_data';
		add_settings_field(
			$field_id,
			__( 'Sync Library', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$tools_section,
			[
				'id' => $field_id,
				'type' => 'raw_html',
				'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-library-sync-button">%s</button>', wp_create_nonce( 'elementor_reset_library' ), __( 'Sync Library', 'elementor' ) ),
				'desc' => __( 'Elementor Library automatically updates on a daily basis. You can also manually update it by clicking on the sync button.', 'elementor' ),
			]
		);

		$field_id = 'elementor_css_print_method';
		add_settings_field(
			$field_id,
			__( 'CSS Print Method', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$tools_section,
			[
				'id' => $field_id,
				'class' => $field_id,
				'type' => 'select',
				'options' => [
					'external' => __( 'External File', 'elementor' ),
					'internal' => __( 'Internal Embedding', 'elementor' ),
				],
				'desc' => '<div class="elementor-css-print-method-description" data-value="external" style="display: none">' .
					__( 'Use external CSS files for all generated stylesheets. Choose this setting for better performance (recommended).', 'elementor' ) .
					'</div>' .
					'<div class="elementor-css-print-method-description" data-value="internal" style="display: none">' .
					__( 'Use internal CSS that is embedded in the head of the page. For troubleshooting server configuration conflicts and managing development environments.', 'elementor' ) .
					'</div>',
			]
		);

		register_setting( Tools::PAGE_ID, $field_id, [ $validations_class_name, 'clear_cache' ] );

		$replace_url_section = 'elementor_replace_url_section';

		add_settings_section(
			$replace_url_section,
			__( 'Replace URL', 'elementor' ),
			function() {
				$intro_text = sprintf( __( '<strong>Important:</strong> It is strongly recommended that you <a target="_blank" href="%s">backup your database</a> before using Replace URL.', 'elementor' ), 'https://codex.wordpress.org/WordPress_Backups' );
				$intro_text = '<p>' . $intro_text . '</p>';

				echo $intro_text;
			},
			self::PAGE_ID
		);

		$field_id = 'elementor_replace_url';
		add_settings_field(
			$field_id,
			__( 'Update Site Address (URL)', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$replace_url_section,
			[
				'id' => $field_id,
				'type' => 'raw_html',
				'html' => sprintf( '<input type="text" name="from" placeholder="http://old-url.com" class="medium-text"><input type="text" name="to" placeholder="http://new-url.com" class="medium-text"><button data-nonce="%s" class="button elementor-button-spinner" id="elementor-replace-url-button">%s</button>', wp_create_nonce( 'elementor_replace_url' ), __( 'Replace URL', 'elementor' ) ),
				'desc' => __( 'Enter your old and new URLs for your WordPress installation, to update all Elementor data (Relevant for domain transfers or move to \'HTTPS\').', 'elementor' ),
			]
		);

		$editor_break_lines_section = 'elementor_editor_break_lines_section';

		add_settings_section(
			$editor_break_lines_section,
			__( 'Editor Loader', 'elementor' ),
			'__return_false',
			self::PAGE_ID
		);

		$field_id = 'elementor_editor_break_lines';
		add_settings_field(
			$field_id,
			__( 'Switch front-end editor loader method', 'elementor' ),
			[ $controls_class_name, 'render' ],
			self::PAGE_ID,
			$editor_break_lines_section,
			[
				'id' => $field_id,
				'type' => 'select',
				'options' => [
					'' => __( 'Disable', 'elementor' ),
					1 => __( 'Enable', 'elementor' ),
				],
				'desc' => __( 'For troubleshooting server configuration conflicts.', 'elementor' ),
			]
		);

		register_setting( Tools::PAGE_ID, $field_id );
	}

	public function display_settings_page() {
		?>
		<div class="wrap">
			<h2><?php _e( 'Tools', 'elementor' ); ?></h2>
			<form method="post" action="options.php">
				<?php
				settings_fields( self::PAGE_ID );
				do_settings_sections( self::PAGE_ID );

				submit_button();
				?>
			</form>
		</div><!-- /.wrap -->
		<?php
	}

	public function ajax_elementor_clear_cache() {
		check_ajax_referer( 'elementor_clear_cache', '_nonce' );

		Plugin::$instance->posts_css_manager->clear_cache();

		wp_send_json_success();
	}

	public function ajax_elementor_replace_url() {
		check_ajax_referer( 'elementor_replace_url', '_nonce' );

		$from = ! empty( $_POST['from'] ) ? trim( $_POST['from'] ) : '';
		$to = ! empty( $_POST['to'] ) ? trim( $_POST['to'] ) : '';

		$is_valid_urls = ( filter_var( $from, FILTER_VALIDATE_URL ) && filter_var( $to, FILTER_VALIDATE_URL ) );
		if ( ! $is_valid_urls ) {
			wp_send_json_error( __( 'The `from` and `to` URL\'s must be a valid URL', 'elementor' ) );
		}

		if ( $from === $to ) {
			wp_send_json_error( __( 'The `from` and `to` URL\'s must be different', 'elementor' ) );
		}

		global $wpdb;

		// @codingStandardsIgnoreStart cannot use `$wpdb->prepare` because it remove's the backslashes
		$rows_affected = $wpdb->query(
			"UPDATE {$wpdb->postmeta} " .
			"SET `meta_value` = REPLACE(`meta_value`, '" . str_replace( '/', '\\\/', $from ) . "', '" . str_replace( '/', '\\\/', $to ) . "') " .
			"WHERE `meta_key` = '_elementor_data' AND `meta_value` LIKE '[%' ;" ); // meta_value LIKE '[%' are json formatted
		// @codingStandardsIgnoreEnd

		if ( false === $rows_affected ) {
			wp_send_json_error( __( 'An error occurred', 'elementor' ) );
		} else {
			Plugin::$instance->posts_css_manager->clear_cache();
			wp_send_json_success( sprintf( __( '%d Rows Affected', 'elementor' ), $rows_affected ) );
		}
	}

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 205 );
		add_action( 'admin_init', [ $this, 'register_settings_fields' ], 20 );

		if ( ! empty( $_POST ) ) {
			add_action( 'wp_ajax_elementor_clear_cache', [ $this, 'ajax_elementor_clear_cache' ] );
			add_action( 'wp_ajax_elementor_replace_url', [ $this, 'ajax_elementor_replace_url' ] );
		}
	}
}
