<?php
namespace Elementor;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Tools extends Settings_Page {

	const PAGE_ID = 'elementor-tools';

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
		parent::__construct();

		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 205 );

		if ( ! empty( $_POST ) ) {
			add_action( 'wp_ajax_elementor_clear_cache', [ $this, 'ajax_elementor_clear_cache' ] );
			add_action( 'wp_ajax_elementor_replace_url', [ $this, 'ajax_elementor_replace_url' ] );
		}
	}

	protected function create_tabs() {
		return [
			'general' => [
				'label' => __( 'General', 'elementor' ),
				'sections' => [
					'tools' => [
						'fields' => [
							'clear_cache' => [
								'label' => __( 'Regenerate CSS', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-clear-cache-button">%s</button>', wp_create_nonce( 'elementor_clear_cache' ), __( 'Regenerate Files', 'elementor' ) ),
									'desc' => __( 'Styles set in Elementor are saved in CSS files in the uploads folder. Recreate those files, according to the most recent settings.', 'elementor' ),
								],
							],
							'reset_api_data' => [
								'label' => __( 'Sync Library', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-library-sync-button">%s</button>', wp_create_nonce( 'elementor_reset_library' ), __( 'Sync Library', 'elementor' ) ),
									'desc' => __( 'Elementor Library automatically updates on a daily basis. You can also manually update it by clicking on the sync button.', 'elementor' ),
								],
							],
						],
					],
					'editor_break_lines' => [
						'label' => __( 'Editor Loader', 'elementor' ),
						'fields' => [
							'editor_break_lines' => [
								'label' => __( 'Switch front-end editor loader method', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'options' => [
										'' => __( 'Disable', 'elementor' ),
										1 => __( 'Enable', 'elementor' ),
									],
									'desc' => __( 'For troubleshooting server configuration conflicts.', 'elementor' ),
								],
							],
						],
					],
				],
			],
			'replace_url' => [
				'label' => __( 'Replace URL', 'elementor' ),
				'sections' => [
					'replace_url' => [
						'callback' => function() {
							$intro_text = sprintf( __( '<strong>Important:</strong> It is strongly recommended that you <a target="_blank" href="%s">backup your database</a> before using Replace URL.', 'elementor' ), 'https://codex.wordpress.org/WordPress_Backups' );
							$intro_text = '<div>' . $intro_text . '</div>';

							echo $intro_text;
						},
						'fields' => [
							'replace_url' => [
								'label' => __( 'Update Site Address (URL)', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf( '<input type="text" name="from" placeholder="http://old-url.com" class="medium-text"><input type="text" name="to" placeholder="http://new-url.com" class="medium-text"><button data-nonce="%s" class="button elementor-button-spinner" id="elementor-replace-url-button">%s</button>', wp_create_nonce( 'elementor_replace_url' ), __( 'Replace URL', 'elementor' ) ),
									'desc' => __( 'Enter your old and new URLs for your WordPress installation, to update all Elementor data (Relevant for domain transfers or move to \'HTTPS\').', 'elementor' ),
								],
							],
						],
					],
				],
			],
		];
	}

	protected function get_page_title() {
		return __( 'Tools', 'elementor' );
	}
}
