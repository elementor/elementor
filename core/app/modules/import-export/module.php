<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Directories\WP_Content;
use Elementor\Core\App\Modules\ImportExport\Directories\WP_Post_Type;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\Core\Base\Document;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Files\Uploads_Manager;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Tools;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Import Export Module
 *
 * Responsible for initializing Elementor App functionality
 */
class Module extends BaseModule {
	const FORMAT_VERSION = '1.0';

	const EXPORT_TRIGGER_KEY = 'elementor_export_kit';

	const IMPORT_TRIGGER_KEY = 'elementor_import_kit';

	const MANIFEST_ERROR_KEY = 'manifest-error';

	const PERMISSIONS_ERROR_KEY = 'plugin-installation-permissions-error';


	/**
	 * @var Export
	 */
	public $export;

	/**
	 * @var Import
	 */
	public $import;

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

	public function get_init_settings() {
		if ( ! Plugin::$instance->app->is_current() ) {
			return [];
		}

		return $this->get_config_data();
	}

	public function get_summary_titles() {
		$summary_titles = [];

		$document_types = Plugin::$instance->documents->get_document_types();

		foreach ( $document_types as $name => $document_type ) {
			$summary_titles['templates'][ $name ] = [
				'single' => $document_type::get_title(),
				'plural' => $document_type::get_plural_title(),
			];
		}

		$post_types = get_post_types_by_support( 'elementor' );
		$post_types[] = 'nav_menu_item';

		foreach ( $post_types as $post_type ) {
			if ( Source_Local::CPT === $post_type ) {
				continue;
			}

			$post_type_object = get_post_type_object( $post_type );

			$summary_titles['content'][ $post_type ] = [
				'single' => $post_type_object->labels->singular_name,
				'plural' => $post_type_object->label,
			];
		}

		$custom_post_types = $this->get_registered_cpt_names();
		if ( ! empty( $custom_post_types ) ) {
			foreach ( $custom_post_types as $custom_post_type ) {

				$custom_post_types_object = get_post_type_object( $custom_post_type );
				//cpt data appears in two arrays:
				//1. content object: in order to show the export summary when completed in getLabel function
				$summary_titles['content'][ $custom_post_type ] = [
					'single' => $custom_post_types_object->labels->singular_name,
					'plural' => $custom_post_types_object->label,
				];

				//2. customPostTypes object: in order to actually export the data
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

	/**
	 * Retrieve custom post type names.
	 *
	 * @since 3.6.0
	 * @access public
	 *
	 * @return array custom post type names.
	 */
	public function get_registered_cpt_names() {

		$post_types = get_post_types( [
			'public' => true,
			'can_export' => true,
		] );

		unset(
			$post_types['attachment'],
			$post_types['page'],
			$post_types['post'],
			$post_types[ Landing_Pages_Module::CPT ],
			$post_types[ Source_Local::CPT ]
		);

		$custom_post_types = [];

		foreach ( $post_types as $post_type ) {
			array_push( $custom_post_types, $post_type );
		}

		return $custom_post_types;
	}

	private function import_stage_1() {
		// PHPCS - Already validated in caller function.
		if ( ! empty( $_POST['e_import_file'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			if (
				! isset( $_POST['e_kit_library_nonce'] ) ||
				! wp_verify_nonce( $_POST['e_kit_library_nonce'], 'kit-library-import' )
			) {
				throw new \Error( esc_html__( 'Invalid kit library nonce', 'elementor' ) );
			}

			$file_url = $_POST['e_import_file'];

			if ( ! filter_var( $file_url, FILTER_VALIDATE_URL ) || 0 !== strpos( $file_url, 'http' ) ) {
				throw new \Error( esc_html__( 'Invalid URL', 'elementor' ) );
			}

			$remote_zip_request = wp_remote_get( $file_url );

			if ( is_wp_error( $remote_zip_request ) ) {
				throw new \Error( $remote_zip_request->get_error_message() );
			}

			if ( 200 !== $remote_zip_request['response']['code'] ) {
				throw new \Error( $remote_zip_request['response']['message'] );
			}

			$file_name = Plugin::$instance->uploads_manager->create_temp_file( $remote_zip_request['body'], 'kit.zip' );
		} else {
			// PHPCS - Already validated in caller function.
			$file_name = $_FILES['e_import_file']['tmp_name']; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		}

		$extraction_result = Plugin::$instance->uploads_manager->extract_and_validate_zip( $file_name, [ 'json', 'xml' ] );

		if ( ! empty( $file_url ) ) {
			Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $file_name ) );
		}

		$session_dir = $extraction_result['extraction_directory'];

		$manifest_file_content = file_get_contents( $session_dir . 'manifest.json', true );

		if ( ! $manifest_file_content ) {
			throw new \Error( self::MANIFEST_ERROR_KEY );
		}

		$manifest_data = json_decode( $manifest_file_content, true );

		// In case that the manifest content is not a valid JSON or empty.
		if ( ! $manifest_data ) {
			throw new \Error( self::MANIFEST_ERROR_KEY );
		}

		if ( isset( $manifest_data['plugins'] ) && ! current_user_can( 'install_plugins' ) ) {
			throw new \Error( static::PERMISSIONS_ERROR_KEY );
		}

		$manifest_data = $this->import->adapt_manifest_structure( $manifest_data );

		$result = [
			'session' => $session_dir,
			'manifest' => $manifest_data,
		];

		$result = apply_filters( 'elementor/import/stage_1/result', $result );

		return $result;
	}

	private function import_stage_2( $settings_directory ) {
		set_time_limit( 0 );

		$result = $this->import->run();

		Plugin::$instance->uploads_manager->remove_file_or_dir( $settings_directory );

		return $result;
	}

	private function on_admin_init() {
		if ( ! isset( $_POST['action'] ) || self::IMPORT_TRIGGER_KEY !== $_POST['action'] || ! wp_verify_nonce( $_POST['_nonce'], Ajax::NONCE_KEY ) ) {
			return;
		}

		$import_settings = json_decode( stripslashes( $_POST['data'] ), true );

		// Set the Request's state as an Elementor upload request, in order to support unfiltered file uploads.
		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );

		try {
			$this->import = new Import( $import_settings );

			if ( 1 === $import_settings['stage'] ) {
				$result = $this->import_stage_1();
			} elseif ( 2 === $import_settings['stage'] ) {
				$result = $this->import_stage_2( $import_settings['session'] );

				// Adding the most updated data of the summaryTitles, in case that the data was changed during the process by new installed plugins.
				$result['configData'] = $this->get_config_data();
			}

			wp_send_json_success( $result );
		} catch ( \Error $error ) {
			wp_send_json_error( $error->getMessage() );
		}
	}

	private function on_init() {
		if ( ! isset( $_POST['action'] ) || self::EXPORT_TRIGGER_KEY !== $_POST['action'] || ! wp_verify_nonce( $_POST['_nonce'], Ajax::NONCE_KEY ) ) {
			return;
		}

		$export_settings = json_decode( stripslashes( $_POST['data'] ), true );

		try {
			$this->export = new Export( self::merge_properties( [], $export_settings, [ 'include', 'kitInfo', 'plugins', 'selectedCustomPostTypes' ] ) );

			$export_result = $this->export->run();

			$file_name = $export_result['file_name'];

			$file = file_get_contents( $file_name, true );

			Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $file_name ) );

			wp_send_json_success( [
				'manifest' => $export_result['manifest'],
				'file' => base64_encode( $file ),
			] );
		} catch ( \Error $error ) {
			wp_send_json_error( $error->getMessage() );
		}
	}

	private function render_import_export_tab_content() {
		$intro_text_link = sprintf( '<a href="https://go.elementor.com/wp-dash-import-export-general" target="_blank">%s</a>', esc_html__( 'Learn more', 'elementor' ) );

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
					'url' => 'https://go.elementor.com/wp-dash-import-export-export-flow',
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
					'url' => 'https://go.elementor.com/wp-dash-import-export-import-flow',
					'text' => esc_html__( 'Learn More', 'elementor' ),
				],
			],
		];

		$home_page_editor_url = $this->get_elementor_editor_home_page_url();
		$editor_page_link = $home_page_editor_url ? $home_page_editor_url : $this->get_recently_edited_elementor_editor_page_url();

		$info_text = esc_html__( 'Even after you import and apply a Template Kit, you can undo it by restoring a previous version of your site.', 'elementor' ) . '<br>';
		$info_text .= sprintf( '<a href="%1$s" target="_blank">%2$s</a>', $editor_page_link . '#e:run:panel/global/open&e:route:panel/history/revisions', esc_html__( 'Open Site Settings > History > Revisions.', 'elementor' ) );
		?>

		<div class="tab-import-export-kit__content">
			<p class="tab-import-export-kit__info"><?php Utils::print_unescaped_internal_string( $intro_text ); ?></p>

			<div class="tab-import-export-kit__wrapper">
				<?php foreach ( $content_data as $data ) { ?>
					<div class="tab-import-export-kit__container">
						<div class="tab-import-export-kit__box">
							<h2><?php Utils::print_unescaped_internal_string( $data['title'] ); ?></h2>
							<a href="<?php Utils::print_unescaped_internal_string( $data['button']['url'] ); ?>" class="elementor-button elementor-button-success">
								<?php Utils::print_unescaped_internal_string( $data['button']['text'] ); ?>
							</a>
						</div>
						<p><?php Utils::print_unescaped_internal_string( $data['description'] ); ?></p>
						<a href="<?php Utils::print_unescaped_internal_string( $data['link']['url'] ); ?>" target="_blank"><?php Utils::print_unescaped_internal_string( $data['link']['text'] ); ?></a>
					</div>
				<?php } ?>
			</div>

			<p class="tab-import-export-kit__info"><?php Utils::print_unescaped_internal_string( $info_text ); ?></p>
		</div>
		<?php
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
		$query = Utils::get_recently_edited_posts_query( [ 'posts_per_page' => 1 ] );

		if ( ! isset( $query->post ) ) {
			return '';
		}

		return $this->get_elementor_page_url( $query->post->ID );
	}

	private function get_recently_edited_elementor_editor_page_url() {
		$query = Utils::get_recently_edited_posts_query( [ 'posts_per_page' => 1 ] );

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

	private function get_config_data() {
		$export_nonce = wp_create_nonce( 'elementor_export' );

		$export_url = add_query_arg( [ '_nonce' => $export_nonce ], Plugin::$instance->app->get_base_url() );

		return [
			'exportURL' => $export_url,
			'summaryTitles' => $this->get_summary_titles(),
			'isUnfilteredFilesEnabled' => Uploads_Manager::are_unfiltered_uploads_enabled(),
			'elementorHomePageUrl' => $this->get_elementor_home_page_url(),
			'recentlyEditedElementorPageUrl' => $this->get_recently_edited_elementor_page_url(),
		];
	}

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

	public function __construct() {
		add_action( 'init', function() {
			$this->on_init();
		} );

		add_action( 'admin_init', function() {
			$this->on_admin_init();
		} );

		$page_id = Tools::PAGE_ID;

		add_action( "elementor/admin/after_create_settings/{$page_id}", [ $this, 'register_settings_tab' ] );

		if ( Utils::is_wp_cli() ) {
			\WP_CLI::add_command( 'elementor kit', WP_CLI::class );
		}
	}
}
