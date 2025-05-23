<?php
namespace Elementor\App\Modules\ImportExport;

use Elementor\App\Modules\ImportExport\Processes\Export;
use Elementor\App\Modules\ImportExport\Processes\Import;
use Elementor\App\Modules\ImportExport\Processes\Revert;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Files\Uploads_Manager;
use Elementor\Modules\System_Info\Reporters\Server;
use Elementor\Plugin;
use Elementor\Tools;
use Elementor\Utils as ElementorUtils;
use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Import Export Module
 *
 * Responsible for initializing Elementor App functionality
 */
class Module extends BaseModule {
	const FORMAT_VERSION = '2.0';

	const EXPORT_TRIGGER_KEY = 'elementor_export_kit';

	const UPLOAD_TRIGGER_KEY = 'elementor_upload_kit';

	const IMPORT_TRIGGER_KEY = 'elementor_import_kit';

	const IMPORT_RUNNER_TRIGGER_KEY = 'elementor_import_kit__runner';

	const REFERRER_KIT_LIBRARY = 'kit-library';

	const REFERRER_LOCAL = 'local';

	const PERMISSIONS_ERROR_KEY = 'plugin-installation-permissions-error';

	const NO_WRITE_PERMISSIONS_KEY = 'no-write-permissions';

	const OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS = 'elementor_import_sessions';

	const OPTION_KEY_ELEMENTOR_REVERT_SESSIONS = 'elementor_revert_sessions';

	const META_KEY_ELEMENTOR_IMPORT_SESSION_ID = '_elementor_import_session_id';

	const META_KEY_ELEMENTOR_EDIT_MODE = '_elementor_edit_mode';

	/**
	 * Assigning the export process to a property, so we can use the process from outside the class.
	 *
	 * @var Export
	 */
	public $export;

	/**
	 * Assigning the import process to a property, so we can use the process from outside the class.
	 *
	 * @var Import
	 */
	public $import;

	/**
	 * Assigning the revert process to a property, so we can use the process from outside the class.
	 *
	 * @var Revert
	 */
	public $revert;

	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'import-export';
	}

	public function __construct() {
		$this->register_actions();

		if ( ElementorUtils::is_wp_cli() ) {
			\WP_CLI::add_command( 'elementor kit', WP_CLI::class );
		}

		( new Usage() )->register();

		$this->revert = new Revert();
	}

	public function get_init_settings() {
		if ( ! Plugin::$instance->app->is_current() ) {
			return [];
		}

		return $this->get_config_data();
	}

	/**
	 * Register the import/export tab in elementor tools.
	 */
	public function register_settings_tab( Tools $tools ) {
		$tools->add_tab( 'import-export-kit', [
			'label' => esc_html__( 'Import / Export Kit', 'elementor' ),
			'sections' => [
				'intro' => [
					'label' => esc_html__( 'Template Kits', 'elementor' ),
					'callback' => function() {
						$this->render_import_export_tab_content();
					},
					'fields' => [],
				],
			],
		] );
	}

	/**
	 * Render the import/export tab content.
	 */
	private function render_import_export_tab_content() {
		$intro_text_link = sprintf( '<a href="https://go.elementor.com/wp-dash-import-export-general/" target="_blank">%s</a>', esc_html__( 'Learn more', 'elementor' ) );

		$intro_text = sprintf(
		/* translators: 1: New line break, 2: Learn More link. */
			__( 'Design sites faster with a template kit that contains some or all components of a complete site, like templates, content & site settings.%1$sYou can import a kit and apply it to your site, or export the elements from this site to be used anywhere else. %2$s', 'elementor' ),
			'<br>',
			$intro_text_link
		);

		$content_data = [
			'export' => [
				'title' => esc_html__( 'Export a Template Kit', 'elementor' ),
				'button' => [
					'url' => Plugin::$instance->app->get_base_url() . '#/export',
					'text' => esc_html__( 'Start Export', 'elementor' ),
				],
				'description' => esc_html__( 'Bundle your whole site - or just some of its elements - to be used for another website.', 'elementor' ),
				'link' => [
					'url' => 'https://go.elementor.com/wp-dash-import-export-export-flow/',
					'text' => esc_html__( 'Learn More', 'elementor' ),
				],
			],
			'import' => [
				'title' => esc_html__( 'Import a Template Kit', 'elementor' ),
				'button' => [
					'url' => Plugin::$instance->app->get_base_url() . '#/import',
					'text' => esc_html__( 'Start Import', 'elementor' ),
				],
				'description' => esc_html__( 'Apply the design and settings of another site to this one.', 'elementor' ),
				'link' => [
					'url' => 'https://go.elementor.com/wp-dash-import-export-import-flow/',
					'text' => esc_html__( 'Learn More', 'elementor' ),
				],
			],
		];

		$last_imported_kit = $this->revert->get_last_import_session();
		$penultimate_imported_kit = $this->revert->get_penultimate_import_session();

		$user_date_format = get_option( 'date_format' );
		$user_time_format = get_option( 'time_format' );
		$date_format = $user_date_format . ' ' . $user_time_format;

		$should_show_revert_section = $this->should_show_revert_section( $last_imported_kit );

		if ( $should_show_revert_section ) {
			if ( ! empty( $penultimate_imported_kit ) ) {
				$revert_text = sprintf(
					esc_html__( 'Remove all the content and site settings that came with "%1$s" on %2$s %3$s and revert to the site setting that came with "%4$s" on %5$s.', 'elementor' ),
					! empty( $last_imported_kit['kit_title'] ) ? $last_imported_kit['kit_title'] : esc_html__( 'imported kit', 'elementor' ),
					gmdate( $date_format, $last_imported_kit['start_timestamp'] ),
					'<br>',
					! empty( $penultimate_imported_kit['kit_title'] ) ? $penultimate_imported_kit['kit_title'] : esc_html__( 'imported kit', 'elementor' ),
					gmdate( $date_format, $penultimate_imported_kit['start_timestamp'] )
				);
			} else {
				$revert_text = sprintf(
					esc_html__( 'Remove all the content and site settings that came with "%1$s" on %2$s.%3$s Your original site settings will be restored.', 'elementor' ),
					! empty( $last_imported_kit['kit_title'] ) ? $last_imported_kit['kit_title'] : esc_html__( 'imported kit', 'elementor' ),
					gmdate( $date_format, $last_imported_kit['start_timestamp'] ),
					'<br>'
				);
			}
		}
		?>

		<div class="tab-import-export-kit__content">
			<p class="tab-import-export-kit__info"><?php ElementorUtils::print_unescaped_internal_string( $intro_text ); ?></p>

			<div class="tab-import-export-kit__wrapper">
				<?php foreach ( $content_data as $data ) { ?>
					<div class="tab-import-export-kit__container">
						<div class="tab-import-export-kit__box">
							<h2><?php ElementorUtils::print_unescaped_internal_string( $data['title'] ); ?></h2>
							<a href="<?php ElementorUtils::print_unescaped_internal_string( $data['button']['url'] ); ?>" class="elementor-button e-primary">
								<?php ElementorUtils::print_unescaped_internal_string( $data['button']['text'] ); ?>
							</a>
						</div>
						<p><?php ElementorUtils::print_unescaped_internal_string( $data['description'] ); ?></p>
						<a href="<?php ElementorUtils::print_unescaped_internal_string( $data['link']['url'] ); ?>" target="_blank"><?php ElementorUtils::print_unescaped_internal_string( $data['link']['text'] ); ?></a>
					</div>
				<?php } ?>
			</div>

			<?php
			if ( $should_show_revert_section ) {

				$link_attributes = [
					'href' => $this->get_revert_href(),
					'id' => 'elementor-import-export__revert_kit',
					'class' => 'button',
				];
				?>
				<div class="tab-import-export-kit__revert">
					<h2>
						<?php ElementorUtils::print_unescaped_internal_string( esc_html__( 'Remove the most recent Kit', 'elementor' ) ); ?>
					</h2>
					<p class="tab-import-export-kit__info">
						<?php ElementorUtils::print_unescaped_internal_string( $revert_text ); ?>
					</p>
					<?php $this->render_last_kit_thumbnail( $last_imported_kit ); ?>
					<a <?php ElementorUtils::print_html_attributes( $link_attributes ); ?> >
						<?php ElementorUtils::print_unescaped_internal_string( esc_html__( 'Remove Kit', 'elementor' ) ); ?>
					</a>
				</div>
			<?php } ?>
		</div>
		<?php
	}

	private function get_revert_href(): string {
		$admin_post_url = admin_url( 'admin-post.php?action=elementor_revert_kit' );
		$nonced_admin_post_url = wp_nonce_url( $admin_post_url, 'elementor_revert_kit' );
		return $this->maybe_add_referrer_param( $nonced_admin_post_url );
	}

	/**
	 * Checks if referred by a kit and adds the referrer ID to the href
	 *
	 * @param string $href
	 *
	 * @return string
	 */
	private function maybe_add_referrer_param( string $href ): string {
		$param_name = 'referrer_kit';

		if ( empty( $_GET[ $param_name ] ) ) {
			return $href;
		}

		return add_query_arg( $param_name, sanitize_key( $_GET[ $param_name ] ), $href );
	}

	/**
	 * Render the last kit thumbnail if exists
	 *
	 * @param $last_imported_kit
	 *
	 * @return void
	 */
	private function render_last_kit_thumbnail( $last_imported_kit ) {
		if ( empty( $last_imported_kit['kit_thumbnail'] ) ) {
			return;
		}

		?>
		<div class="tab-import-export-kit__kit-item-row">
			<article class="tab-import-export-kit__kit-item">
				<header>
					<h3>
						<?php echo esc_html( $last_imported_kit['kit_title'] ); ?>
					</h3>
				</header>
				<img
					src="<?php echo esc_url( $last_imported_kit['kit_thumbnail'] ); ?>"
					alt="<?php echo esc_attr( $last_imported_kit['kit_title'] ); ?>"
				>
			</article>
		</div>
		<?php
	}

	/**
	 * Upload a kit zip file and get the kit data.
	 *
	 * Assigning the Import process to the 'import' property,
	 * so it will be available to use in different places such as: WP_Cli, Pro, etc.
	 *
	 * @param string $file Path to the file.
	 * @param string $referrer Referrer of the file 'local' or 'kit-library'.
	 * @return array
	 * @throws \Exception
	 */
	public function upload_kit( $file, $referrer ) {
		$this->ensure_writing_permissions();

		$this->import = new Import( $file, [ 'referrer' => $referrer ] );

		return [
			'session' => $this->import->get_session_id(),
			'manifest' => $this->import->get_manifest(),
			'conflicts' => $this->import->get_settings_conflicts(),
		];
	}

	/**
	 * Import a kit by session_id.
	 * Upload and import a kit by kit zip file.
	 *
	 * If the split_to_chunks flag is true, the process won't start
	 * It will initialize the import process and return the session_id and the runners.
	 *
	 * Assigning the Import process to the 'import' property,
	 * so it will be available to use in different places such as: WP_Cli, Pro, etc.
	 *
	 * @param string $path Path to the file or session_id.
	 * @param array $settings Settings the import use to determine which content to import.
	 *      (e.g: include, selected_plugins, selected_cpt, selected_override_conditions, etc.)
	 * @param bool $split_to_chunks Determine if the import process should be split into chunks.
	 * @return array
	 * @throws \Exception
	 */
	public function import_kit( string $path, array $settings, bool $split_to_chunks = false ): array {
		$this->ensure_writing_permissions();

		$this->import = new Import( $path, $settings );
		$this->import->register_default_runners();

		do_action( 'elementor/import-export/import-kit', $this->import );

		if ( $split_to_chunks ) {
			$this->import->init_import_session( true );

			return [
				'session' => $this->import->get_session_id(),
				'runners' => $this->import->get_runners_name(),
			];
		}

		return $this->import->run();
	}

	/**
	 * Resuming import process by re-creating the import instance and running the specific runner.
	 *
	 * @param string $session_id The id off the import session.
	 * @param string $runner_name The specific runner that we want to run.
	 *
	 * @return array Two types of response.
	 *      1. The status and the runner name.
	 *      2. The imported data. (Only if the runner is the last one in the import process)
	 * @throws \Exception
	 */
	public function import_kit_by_runner( string $session_id, string $runner_name ): array {
		// Check session_id
		$this->import = Import::from_session( $session_id );
		$runners = $this->import->get_runners_name();

		$run = $this->import->run_runner( $runner_name );

		if ( end( $runners ) === $run['runner'] ) {
			return $this->import->get_imported_data();
		}

		return $run;
	}

	/**
	 * Export a kit.
	 *
	 * Assigning the Export process to the 'export' property,
	 * so it will be available to use in different places such as: WP_Cli, Pro, etc.
	 *
	 * @param array $settings Settings the export use to determine which content to export.
	 *      (e.g: include, kit_info, selected_plugins, selected_cpt, etc.)
	 * @return array
	 * @throws \Exception
	 */
	public function export_kit( array $settings ) {
		$this->ensure_writing_permissions();

		$this->export = new Export( $settings );
		$this->export->register_default_runners();

		do_action( 'elementor/import-export/export-kit', $this->export );

		return $this->export->run();
	}

	/**
	 * Handle revert kit ajax request.
	 */
	public function revert_last_imported_kit() {
		$this->revert = new Revert();
		$this->revert->register_default_runners();

		do_action( 'elementor/import-export/revert-kit', $this->revert );

		$this->revert->run();
	}


	/**
	 * Handle revert last imported kit ajax request.
	 */
	public function handle_revert_last_imported_kit() {
		check_admin_referer( 'elementor_revert_kit' );

		$this->revert_last_imported_kit();

		wp_safe_redirect( admin_url( 'admin.php?page=' . Tools::PAGE_ID . '#tab-import-export-kit' ) );
		die;
	}

	/**
	 * Register appropriate actions.
	 */
	private function register_actions() {
		add_action( 'admin_init', function() {
			if ( wp_doing_ajax() &&
				isset( $_POST['action'] ) &&
				wp_verify_nonce( ElementorUtils::get_super_global_value( $_POST, '_nonce' ), Ajax::NONCE_KEY ) &&
				current_user_can( 'manage_options' )
			) {
				$this->maybe_handle_ajax();
			}
		} );

		add_action( 'admin_post_elementor_revert_kit', [ $this, 'handle_revert_last_imported_kit' ] );

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );

		$page_id = Tools::PAGE_ID;

		add_action( "elementor/admin/after_create_settings/{$page_id}", [ $this, 'register_settings_tab' ] );
	}

	private function ensure_writing_permissions() {
		$server = new Server();

		$paths_to_check = [
			Server::KEY_PATH_WP_CONTENT_DIR => $server->get_system_path( Server::KEY_PATH_WP_CONTENT_DIR ),
			Server::KEY_PATH_UPLOADS_DIR => $server->get_system_path( Server::KEY_PATH_UPLOADS_DIR ),
			Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR => $server->get_system_path( Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR ),
		];

		$permissions = $server->get_paths_permissions( $paths_to_check );

		// WP Content dir has to be exists and writable.
		if ( ! $permissions[ Server::KEY_PATH_WP_CONTENT_DIR ]['write'] ) {
			throw new \Error( self::NO_WRITE_PERMISSIONS_KEY . 'in - ' . Server::KEY_PATH_WP_CONTENT_DIR );
		}

		// WP Uploads dir has to be exists and writable.
		if ( ! $permissions[ Server::KEY_PATH_UPLOADS_DIR ]['write'] ) {
			throw new \Error( self::NO_WRITE_PERMISSIONS_KEY . 'in - ' . Server::KEY_PATH_UPLOADS_DIR );
		}

		// Elementor uploads dir permissions is divided to 2 cases:
		// 1. If the dir exists, it has to be writable.
		// 2. If the dir doesn't exist, the parent dir has to be writable (wp uploads dir), so we can create it.
		if ( $permissions[ Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR ]['exists'] && ! $permissions[ Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR ]['write'] ) {
			throw new \Error( self::NO_WRITE_PERMISSIONS_KEY . 'in - ' . Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );
		}
	}

	/**
	 * Enqueue admin scripts
	 */
	public function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-import-export-admin',
			$this->get_js_assets_url( 'import-export-admin' ),
			[ 'elementor-common' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'elementor-import-export-admin',
			'elementorImportExport',
			[
				'lastImportedSession' => $this->revert->get_last_import_session(),
				'appUrl' => Plugin::$instance->app->get_base_url() . '#/kit-library',
			]
		);
	}

	/**
	 * Assign each ajax action to a method.
	 */
	private function maybe_handle_ajax() {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		$action = ElementorUtils::get_super_global_value( $_POST, 'action' );

		switch ( $action ) {
			case static::EXPORT_TRIGGER_KEY:
				$this->handle_export_kit();
				break;

			case static::UPLOAD_TRIGGER_KEY:
				$this->handle_upload_kit();
				break;

			case static::IMPORT_TRIGGER_KEY:
				$this->handle_import_kit();
				break;

			case static::IMPORT_RUNNER_TRIGGER_KEY:
				$this->handle_import_kit__runner();
				break;

			default:
				break;
		}
	}

	/**
	 * Handle upload kit ajax request.
	 */
	private function handle_upload_kit() {
		// PHPCS - A URL that should contain special chars (auth headers information).
		$file_url = isset( $_POST['e_import_file'] )
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			? wp_unslash( $_POST['e_import_file'] )
			: '';

		// Import from kit library
		if ( ! empty( $file_url ) ) {
			if (
				! wp_verify_nonce( ElementorUtils::get_super_global_value( $_POST, 'e_kit_library_nonce' ), 'kit-library-import' )
			) {
				throw new \Error( 'Invalid kit library nonce.' );
			}

			if ( ! filter_var( $file_url, FILTER_VALIDATE_URL ) || 0 !== strpos( $file_url, 'http' ) ) {
				throw new \Error( 'Invalid URL.' );
			}

			$remote_zip_request = wp_remote_get( $file_url );

			if ( is_wp_error( $remote_zip_request ) ) {
				throw new \Error( $remote_zip_request->get_error_message() );
			}

			if ( 200 !== $remote_zip_request['response']['code'] ) {
				throw new \Error( $remote_zip_request['response']['message'] );
			}

			$file_name = Plugin::$instance->uploads_manager->create_temp_file( $remote_zip_request['body'], 'kit.zip' );
			$referrer = static::REFERRER_KIT_LIBRARY;
		} else {
			// PHPCS - Already validated in caller function.
			$file_name = ElementorUtils::get_super_global_value( $_FILES, 'e_import_file' )['tmp_name'];
			$referrer = static::REFERRER_LOCAL;
		}

		$uploaded_kit = $this->upload_kit( $file_name, $referrer );
		$session_dir = $uploaded_kit['session'];
		$manifest = $uploaded_kit['manifest'];
		$conflicts = $uploaded_kit['conflicts'];

		if ( ! empty( $file_url ) ) {
			Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $file_name ) );
		}

		if ( isset( $manifest['plugins'] ) && ! current_user_can( 'install_plugins' ) ) {
			throw new \Error( static::PERMISSIONS_ERROR_KEY );
		}

		$result = [
			'session' => $session_dir,
			'manifest' => $manifest,
		];

		if ( ! empty( $conflicts ) ) {
			$result['conflicts'] = $conflicts;
		} else {
			// Moved into the IE process \Elementor\App\Modules\ImportExport\Processes\Import::get_default_settings_conflicts
			// TODO: remove in 3.10.0
			$result = apply_filters( 'elementor/import/stage_1/result', $result );
		}

		wp_send_json_success( $result );
	}

	/**
	 * Handle import kit ajax request.
	 */
	private function handle_import_kit() {
		// PHPCS - Already validated in caller function
		$settings = json_decode( ElementorUtils::get_super_global_value( $_POST, 'data' ), true ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$tmp_folder_id = $settings['session'];

		$import = $this->import_kit( $tmp_folder_id, $settings, true );

		// get_settings_config() added manually because the frontend Ajax request doesn't trigger the get_init_settings().
		$import['configData'] = $this->get_config_data();

		wp_send_json_success( $import );
	}

	/**
	 * Handle ajax request for running specific runner in the import kit process.
	 */
	private function handle_import_kit__runner() {
		// PHPCS - Already validated in caller function
		$settings = json_decode( ElementorUtils::get_super_global_value( $_POST, 'data' ), true ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$session_id = $settings['session'];
		$runner = $settings['runner'];

		$import = $this->import_kit_by_runner( $session_id, $runner );

		// get_settings_config() added manually because the frontend Ajax request doesn't trigger the get_init_settings().
		$import['configData'] = $this->get_config_data();

		wp_send_json_success( $import );
	}

	/**
	 * Handle export kit ajax request.
	 */
	private function handle_export_kit() {
		// PHPCS - Already validated in caller function
		$settings = json_decode( ElementorUtils::get_super_global_value( $_POST, 'data' ), true ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$export = $this->export_kit( $settings );

		$file_name = $export['file_name'];
		$file = ElementorUtils::file_get_contents( $file_name );

		if ( ! $file ) {
			throw new \Error( 'Could not read the exported file.' );
		}

		Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $file_name ) );

		$result = [
			'manifest' => $export['manifest'],
			'file' => base64_encode( $file ),
		];

		wp_send_json_success( $result );
	}

	/**
	 * Get config data that will be exposed to the frontend.
	 */
	private function get_config_data() {
		$export_nonce = wp_create_nonce( 'elementor_export' );
		$export_url = add_query_arg( [ '_nonce' => $export_nonce ], Plugin::$instance->app->get_base_url() );

		return [
			'exportURL' => $export_url,
			'summaryTitles' => $this->get_summary_titles(),
			'builtinWpPostTypes' => ImportExportUtils::get_builtin_wp_post_types(),
			'elementorPostTypes' => ImportExportUtils::get_elementor_post_types(),
			'isUnfilteredFilesEnabled' => Uploads_Manager::are_unfiltered_uploads_enabled(),
			'elementorHomePageUrl' => $this->get_elementor_home_page_url(),
			'recentlyEditedElementorPageUrl' => $this->get_recently_edited_elementor_page_url(),
			'tools_url' => Tools::get_url(),
			'importSessions' => Revert::get_import_sessions(),
			'lastImportedSession' => $this->revert->get_last_import_session(),
		];
	}

	/**
	 * Get labels of Elementor document types, Elementor Post types, WordPress Post types and Custom Post types.
	 */
	private function get_summary_titles() {
		$summary_titles = [];

		$document_types = Plugin::$instance->documents->get_document_types();

		foreach ( $document_types as $name => $document_type ) {
			$summary_titles['templates'][ $name ] = [
				'single' => $document_type::get_title(),
				'plural' => $document_type::get_plural_title(),
			];
		}

		$elementor_post_types = ImportExportUtils::get_elementor_post_types();
		$wp_builtin_post_types = ImportExportUtils::get_builtin_wp_post_types();
		$post_types = array_merge( $elementor_post_types, $wp_builtin_post_types );

		foreach ( $post_types as $post_type ) {
			$post_type_object = get_post_type_object( $post_type );

			$summary_titles['content'][ $post_type ] = [
				'single' => $post_type_object->labels->singular_name,
				'plural' => $post_type_object->label,
			];
		}

		$custom_post_types = ImportExportUtils::get_registered_cpt_names();
		if ( ! empty( $custom_post_types ) ) {
			foreach ( $custom_post_types as $custom_post_type ) {

				$custom_post_types_object = get_post_type_object( $custom_post_type );
				// CPT data appears in two arrays:
				// 1. content object: in order to show the export summary when completed in getLabel function
				$summary_titles['content'][ $custom_post_type ] = [
					'single' => $custom_post_types_object->labels->singular_name,
					'plural' => $custom_post_types_object->label,
				];

				// 2. customPostTypes object: in order to actually export the data
				$summary_titles['content']['customPostTypes'][ $custom_post_type ] = [
					'single' => $custom_post_types_object->labels->singular_name,
					'plural' => $custom_post_types_object->label,
				];
			}
		}

		$active_kit = Plugin::$instance->kits_manager->get_active_kit();

		foreach ( $active_kit->get_tabs() as $key => $tab ) {
			$summary_titles['site-settings'][ $key ] = $tab->get_title();
		}

		return $summary_titles;
	}

	public function should_show_revert_section( $last_imported_kit ) {
		if ( empty( $last_imported_kit ) ) {
			return false;
		}

		// TODO: BC - remove in the future
		//  The 'templates' runner was in core and moved to the Pro plugin. (Part of it still exits in the Core for BC)
		//  The runner that is in the core version is missing the revert functionality,
		//  therefore we shouldn't display the revert section if the import process done with the core version.
		$is_import_templates_ran = isset( $last_imported_kit['runners']['templates'] );
		if ( $this->has_pro() && $is_import_templates_ran ) {
			$has_imported_templates = ! empty( $last_imported_kit['runners']['templates'] );

			return $has_imported_templates;
		}

		return true;
	}

	public function has_pro(): bool {
		return ElementorUtils::has_pro();
	}

	private function get_elementor_editor_home_page_url() {
		if ( 'page' !== get_option( 'show_on_front' ) ) {
			return '';
		}

		$frontpage_id = get_option( 'page_on_front' );

		return $this->get_elementor_editor_page_url( $frontpage_id );
	}

	private function get_elementor_home_page_url() {
		if ( 'page' !== get_option( 'show_on_front' ) ) {
			return '';
		}

		$frontpage_id = get_option( 'page_on_front' );

		return $this->get_elementor_page_url( $frontpage_id );
	}

	private function get_recently_edited_elementor_page_url() {
		$query = ElementorUtils::get_recently_edited_posts_query( [ 'posts_per_page' => 1 ] );

		if ( ! isset( $query->post ) ) {
			return '';
		}

		return $this->get_elementor_page_url( $query->post->ID );
	}

	private function get_recently_edited_elementor_editor_page_url() {
		$query = ElementorUtils::get_recently_edited_posts_query( [ 'posts_per_page' => 1 ] );

		if ( ! isset( $query->post ) ) {
			return '';
		}

		return $this->get_elementor_editor_page_url( $query->post->ID );
	}

	private function get_elementor_document( $page_id ) {
		$document = Plugin::$instance->documents->get( $page_id );

		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return false;
		}

		return $document;
	}

	private function get_elementor_page_url( $page_id ) {
		$document = $this->get_elementor_document( $page_id );

		return $document ? $document->get_preview_url() : '';
	}

	private function get_elementor_editor_page_url( $page_id ) {
		$document = $this->get_elementor_document( $page_id );

		return $document ? $document->get_edit_url() : '';
	}
}
