<?php
namespace Elementor;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Admin\Menu\Main as MainMenu;
use Elementor\Core\Kits\Manager;
use Elementor\Includes\Settings\AdminMenuItems\Tools_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor "Tools" page in WordPress Dashboard.
 *
 * Elementor settings page handler class responsible for creating and displaying
 * Elementor "Tools" page in WordPress dashboard.
 *
 * @since 1.0.0
 */
class Tools extends Settings_Page {

	/**
	 * Settings page ID for Elementor tools.
	 */
	const PAGE_ID = 'elementor-tools';

	private function register_admin_menu( MainMenu $menu ) {
		$menu->add_submenu( [
			'page_title' => esc_html__( 'Tools', 'elementor' ),
			'menu_title' => esc_html__( 'Tools', 'elementor' ),
			'menu_slug' => self::PAGE_ID,
			'function' => [ $this, 'display_settings_page' ],
			'index' => 50,
		] );
	}

	/**
	 * Clear cache.
	 *
	 * Delete post meta containing the post CSS file data. And delete the actual
	 * CSS files from the upload directory.
	 *
	 * Fired by `wp_ajax_elementor_clear_cache` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function ajax_elementor_clear_cache() {
		check_ajax_referer( 'elementor_clear_cache', '_nonce' );

		Plugin::$instance->files_manager->clear_cache();

		wp_send_json_success();
	}

	/**
	 * Recreate kit.
	 *
	 * Recreate default kit (only when default kit does not exist).
	 *
	 * Fired by `wp_ajax_elementor_recreate_kit` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function ajax_elementor_recreate_kit() {
		check_ajax_referer( 'elementor_recreate_kit', '_nonce' );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit->get_id() ) {
			wp_send_json_error( [ 'message' => esc_html__( 'There\'s already an active kit.', 'elementor' ) ], 400 );
		}

		$created_default_kit = Plugin::$instance->kits_manager->create_default();

		if ( ! $created_default_kit ) {
			wp_send_json_error( [ 'message' => esc_html__( 'An error occurred while trying to create a kit.', 'elementor' ) ], 500 );
		}

		update_option( Manager::OPTION_ACTIVE, $created_default_kit );

		wp_send_json_success( esc_html__( 'New kit have been created successfully', 'elementor' ) );
	}

	/**
	 * Replace URLs.
	 *
	 * Sends an ajax request to replace old URLs to new URLs. This method also
	 * updates all the Elementor data.
	 *
	 * Fired by `wp_ajax_elementor_replace_url` action.
	 *
	 * @since 1.1.0
	 * @access public
	 */
	public function ajax_elementor_replace_url() {
		check_ajax_referer( 'elementor_replace_url', '_nonce' );

		$from = Utils::get_super_global_value( $_POST, 'from' ) ?? '';
		$to = Utils::get_super_global_value( $_POST, 'to' ) ?? '';

		try {
			$results = Utils::replace_urls( $from, $to );
			wp_send_json_success( $results );
		} catch ( \Exception $e ) {
			wp_send_json_error( $e->getMessage() );
		}
	}

	/**
	 * Elementor version rollback.
	 *
	 * Rollback to previous Elementor version.
	 *
	 * Fired by `admin_post_elementor_rollback` action.
	 *
	 * @since 1.5.0
	 * @access public
	 */
	public function post_elementor_rollback() {
		check_admin_referer( 'elementor_rollback' );

		if ( ! static::can_user_rollback_versions() ) {
			wp_die( esc_html__( 'Not allowed to rollback versions', 'elementor' ) );
		}

		$rollback_versions = $this->get_rollback_versions();
		$version = Utils::get_super_global_value( $_GET, 'version' );

		if ( empty( $version ) || ! in_array( $version, $rollback_versions, true ) ) {
			wp_die( esc_html__( 'Error occurred, The version selected is invalid. Try selecting different version.', 'elementor' ) );
		}

		$plugin_slug = basename( ELEMENTOR__FILE__, '.php' );

		$rollback = new Rollback(
			[
				'version' => $version,
				'plugin_name' => ELEMENTOR_PLUGIN_BASE,
				'plugin_slug' => $plugin_slug,
				'package_url' => sprintf( 'https://downloads.wordpress.org/plugin/%s.%s.zip', $plugin_slug, $version ),
			]
		);

		$rollback->run();

		wp_die(
			'', esc_html__( 'Rollback to Previous Version', 'elementor' ), [
				'response' => 200,
			]
		);
	}

	/**
	 * Tools page constructor.
	 *
	 * Initializing Elementor "Tools" page.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		if ( Plugin::$instance->experiments->is_feature_active( 'admin_menu_rearrangement' ) ) {
			add_action( 'elementor/admin/menu_registered/elementor', function( MainMenu $menu ) {
				$this->register_admin_menu( $menu );
			} );
		} else {
			add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
				$admin_menu->register( static::PAGE_ID, new Tools_Menu_Item( $this ) );
			}, Settings::ADMIN_MENU_PRIORITY + 20 );
		}

		add_action( 'wp_ajax_elementor_clear_cache', [ $this, 'ajax_elementor_clear_cache' ] );
		add_action( 'wp_ajax_elementor_replace_url', [ $this, 'ajax_elementor_replace_url' ] );
		add_action( 'wp_ajax_elementor_recreate_kit', [ $this, 'ajax_elementor_recreate_kit' ] );

		add_action( 'admin_post_elementor_rollback', [ $this, 'post_elementor_rollback' ] );
	}

	private function get_rollback_versions() {
		$rollback_versions = get_transient( 'elementor_rollback_versions_' . ELEMENTOR_VERSION );
		if ( false === $rollback_versions ) {
			$max_versions = 30;

			require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

			$plugin_information = plugins_api(
				'plugin_information', [
					'slug' => 'elementor',
				]
			);

			if ( empty( $plugin_information->versions ) || ! is_array( $plugin_information->versions ) ) {
				return [];
			}

			uksort( $plugin_information->versions, 'version_compare' );
			$plugin_information->versions = array_reverse( $plugin_information->versions );

			$rollback_versions = [];

			$current_index = 0;
			foreach ( $plugin_information->versions as $version => $download_link ) {
				if ( $max_versions <= $current_index ) {
					break;
				}

				$lowercase_version = strtolower( $version );
				$is_valid_rollback_version = ! preg_match( '/(trunk|beta|rc|dev)/i', $lowercase_version );

				/**
				 * Is rollback version is valid.
				 *
				 * Filters the check whether the rollback version is valid.
				 *
				 * @param bool $is_valid_rollback_version Whether the rollback version is valid.
				 */
				$is_valid_rollback_version = apply_filters(
					'elementor/settings/tools/rollback/is_valid_rollback_version',
					$is_valid_rollback_version,
					$lowercase_version
				);

				if ( ! $is_valid_rollback_version ) {
					continue;
				}

				if ( version_compare( $version, ELEMENTOR_VERSION, '>=' ) ) {
					continue;
				}

				$current_index++;
				$rollback_versions[] = $version;
			}

			set_transient( 'elementor_rollback_versions_' . ELEMENTOR_VERSION, $rollback_versions, WEEK_IN_SECONDS );
		}

		return $rollback_versions;
	}

	/**
	 * Create tabs.
	 *
	 * Return the tools page tabs, sections and fields.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @return array An array with the page tabs, sections and fields.
	 */
	protected function create_tabs() {
		$rollback_html = '<select class="elementor-rollback-select">';

		foreach ( $this->get_rollback_versions() as $version ) {
			$rollback_html .= "<option value='{$version}'>$version</option>";
		}
		$rollback_html .= '</select>';

		$tabs = [
			'general' => [
				'label' => esc_html__( 'General', 'elementor' ),
				'sections' => [
					'tools' => [
						'fields' => [
							'clear_cache' => [
								'label' => esc_html__( 'Regenerate CSS & Data', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-clear-cache-button">%s</button>', wp_create_nonce( 'elementor_clear_cache' ), esc_html__( 'Regenerate Files & Data', 'elementor' ) ),
									'desc' => esc_html__( 'Styles set in Elementor are saved in CSS files in the uploads folder and in the site’s database. Recreate those files and settings, according to the most recent settings.', 'elementor' ),
								],
							],
							'reset_api_data' => [
								'label' => esc_html__( 'Sync Library', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-library-sync-button">%s</button>', wp_create_nonce( 'elementor_reset_library' ), esc_html__( 'Sync Library', 'elementor' ) ),
									'desc' => esc_html__( 'Elementor Library automatically updates on a daily basis. You can also manually update it by clicking on the sync button.', 'elementor' ),
								],
							],
						],
					],
				],
			],
			'replace_url' => [
				'label' => esc_html__( 'Replace URL', 'elementor' ),
				'sections' => [
					'replace_url' => [
						'callback' => function() {
							$intro_text = sprintf(
								/* translators: %s: WordPress backups documentation. */
								__( '<strong>Important:</strong> It is strongly recommended that you <a target="_blank" href="%s">backup your database</a> before using Replace URL.', 'elementor' ),
								'http://go.elementor.com/wordpress-backups/'
							);
							$intro_text = '<div>' . $intro_text . '</div>';

							echo '<h2>' . esc_html__( 'Replace URL', 'elementor' ) . '</h2>';
							Utils::print_unescaped_internal_string( $intro_text );
						},
						'fields' => [
							'replace_url' => [
								'label' => esc_html__( 'Update Site Address (URL)', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf( '<input type="text" name="from" placeholder="http://old-url.com" class="large-text"><input type="text" name="to" placeholder="http://new-url.com" class="large-text"><button data-nonce="%s" class="button elementor-button-spinner" id="elementor-replace-url-button">%s</button>', wp_create_nonce( 'elementor_replace_url' ), esc_html__( 'Replace URL', 'elementor' ) ),
									'desc' => esc_html__( 'Enter your old and new URLs for your WordPress installation, to update all Elementor data (Relevant for domain transfers or move to \'HTTPS\').', 'elementor' ),
								],
							],
						],
					],
				],
			],
			'versions' => [
				'show_if' => static::can_user_rollback_versions(),
				'label' => esc_html__( 'Version Control', 'elementor' ),
				'sections' => [
					'rollback' => [
						'label' => esc_html__( 'Rollback to Previous Version', 'elementor' ),
						'callback' => function() {
							$intro_text = sprintf(
								/* translators: %s: Elementor version. */
								esc_html__( 'Experiencing an issue with Elementor version %s? Rollback to a previous version before the issue appeared.', 'elementor' ),
								ELEMENTOR_VERSION
							);
							$intro_text = '<p>' . $intro_text . '</p>';

							Utils::print_unescaped_internal_string( $intro_text );
						},
						'fields' => [
							'rollback' => [
								'label' => esc_html__( 'Rollback Version', 'elementor' ),
								'field_args' => [
									'type' => 'raw_html',
									'html' => sprintf(
										$rollback_html . '<a data-placeholder-text="' . esc_html__( 'Reinstall', 'elementor' ) . ' v{VERSION}" href="#" data-placeholder-url="%s" class="button elementor-button-spinner elementor-rollback-button">%s</a>',
										wp_nonce_url( admin_url( 'admin-post.php?action=elementor_rollback&version=VERSION' ), 'elementor_rollback' ),
										esc_html__( 'Reinstall', 'elementor' )
									),
									'desc' => '<span style="color: red;">' . esc_html__( 'Warning: Please backup your database before making the rollback.', 'elementor' ) . '</span>',
								],
							],
						],
					],
					'beta' => [
						'label' => esc_html__( 'Become a Beta Tester', 'elementor' ),
						'callback' => function() {
							echo '<p>' .
								esc_html__( 'Turn-on Beta Tester, to get notified when a new beta version of Elementor or Elementor Pro is available. The Beta version will not install automatically. You always have the option to ignore it.', 'elementor' ) .
								'</p>';
							echo sprintf(
								/* translators: 1: Link open tag, 2: Link close tag. */
								esc_html__( '%1$sClick here%2$s to join our first-to-know email updates.', 'elementor' ),
								'<a id="beta-tester-first-to-know" href="#">',
								'</a>'
							);
						},
						'fields' => [
							'beta' => [
								'label' => esc_html__( 'Beta Tester', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => 'no',
									'options' => [
										'no' => esc_html__( 'Disable', 'elementor' ),
										'yes' => esc_html__( 'Enable', 'elementor' ),
									],
									'desc' => '<span style="color: red;">' . esc_html__( 'Please Note: We do not recommend updating to a beta version on production sites.', 'elementor' ) . '</span>',
								],
							],
						],
					],
				],
			],
		];

		if ( ! Plugin::$instance->kits_manager->get_active_kit()->get_id() ) {
			$tabs['general']['sections']['tools']['fields']['recreate_kit'] = [
				'label' => esc_html__( 'Recreate Kit', 'elementor' ),
				'field_args' => [
					'type' => 'raw_html',
					'html' => sprintf( '<button data-nonce="%s" class="button elementor-button-spinner" id="elementor-recreate-kit-button">%s</button>', wp_create_nonce( 'elementor_recreate_kit' ), esc_html__( 'Recreate Kit', 'elementor' ) ),
					'desc' => esc_html__( 'It seems like your site doesn\'t have any active Kit. The active Kit includes all of your Site Settings. By recreating your Kit you will able to start edit your Site Settings again.', 'elementor' ),
				],
			];
		}
		return $tabs;
	}

	/**
	 * Get tools page title.
	 *
	 * Retrieve the title for the tools page.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @return string Tools page title.
	 */
	protected function get_page_title() {
		return esc_html__( 'Tools', 'elementor' );
	}

	/**
	 * Check if the current user can access the version control tab and rollback versions.
	 *
	 * @return bool
	 */
	public static function can_user_rollback_versions() {
		return current_user_can( 'activate_plugins' ) && current_user_can( 'update_plugins' );
	}
}
