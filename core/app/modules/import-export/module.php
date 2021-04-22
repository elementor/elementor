<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Tools;

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

	/**
	 * @var Export
	 */
	private $export;

	/**
	 * @var Import
	 */
	private $import;

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

		$export_nonce = wp_create_nonce( 'elementor_export' );
		$export_url = add_query_arg( [ 'nonce' => $export_nonce ], Plugin::$instance->app->get_base_url() );

		$kit_post = Plugin::$instance->kits_manager->get_active_kit()->get_post();

		$document_types = Plugin::$instance->documents->get_document_types();

		$summary_titles = [];

		foreach ( $document_types as $document_type ) {
			$category = '';

			if ( $document_type::get_property( 'show_in_library' ) ) {
				$category = 'templates';
			} elseif ( $document_type::get_property( 'support_wp_page_templates' ) && $document_type::get_property( 'has_elements' ) ) {
				$category = 'content';
			}

			if ( ! $category ) {
				continue;
			}

			/**
			 * @var Document $instance
			 */
			$instance = new $document_type();

			$summary_titles[ $category ][ $instance->get_name() ] = [
				'single' => $document_type::get_title(),
				'plural' => $document_type::get_plural_title(),
			];
		}

		return [
			'exportURL' => $export_url,
			'defaultKit' => [
				'title' => $kit_post->post_title,
				'description' => $kit_post->post_excerpt,
				'thumbnail' => get_the_post_thumbnail_url( $kit_post ),
			],
			'summaryTitles' => $summary_titles,
		];
	}

	private function on_admin_init() {
		if ( ! isset( $_POST['action'] ) || self::IMPORT_TRIGGER_KEY !== $_POST['action'] || ! wp_verify_nonce( $_POST['nonce'], Ajax::NONCE_KEY ) ) {
			return;
		}

		try {
			$import_settings = json_decode( stripslashes( $_POST['data'] ), true );

			if ( ! empty( $_POST['e_import_file'] ) ) {
				$remote_zip_request = wp_remote_get( $_POST['e_import_file'] );

				if ( is_wp_error( $remote_zip_request ) ) {
					throw new \Error( $remote_zip_request->get_error_message() );
				}

				if ( 200 !== $remote_zip_request['response']['code'] ) {
					throw new \Error( $remote_zip_request['response']['message'] );
				}

				$import_settings['file_name'] = Plugin::$instance->uploads_manager->create_temp_file( $remote_zip_request['body'], 'kit.zip' );
			} else {
				$import_settings['file_name'] = $_FILES['e_import_file']['tmp_name'];
			}

			$this->import = new Import( $import_settings );

			$result = $this->import->run();

			if ( ! empty( $_POST['e_import_file'] ) ) {
				Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $import_settings['file_name'] ) );
			}

			wp_send_json_success( $result );
		} catch ( \Error $error ) {
			wp_send_json_error( $error->getMessage() );
		}
	}

	private function on_elementor_init() {
		if ( isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			if ( ! wp_verify_nonce( $_GET['nonce'], 'elementor_export' ) ) {
				return;
			}

			$export_settings = $_GET[ self::EXPORT_TRIGGER_KEY ];

			try {
				$this->export = new Export( self::merge_properties( [], $export_settings, [ 'include' ] ) );

				$export_result = $this->export->run();

				$file_name = $export_result['file_name'];

				$file = file_get_contents( $file_name, true );

				Plugin::$instance->uploads_manager->remove_file_or_dir( dirname( $file_name ) );

				wp_send_json_success( [
					'manifest' => $export_result['manifest'],
					'file' => base64_encode( $file ),
				] );
			} catch ( \Error $error ) {
				wp_die( $error->getMessage() );
			}
		}
	}

	private function render_import_export_tab_content() {
		$intro_text_link = sprintf( '<a href="https://go.elementor.com/wp-dash-import-export-general" target="_blank">%s</a>', __( 'Learn more', 'elementor' ) );

		$intro_text = sprintf(
			/* translators: %1$s: New line break, %2$s: Learn More link. */
			__( 'Design sites faster with a template kit that contains some or all components of a complete site, like templates, content & site settings.%1$sYou can import a kit and apply it to your site, or export the elements from this site to be used anywhere else. %2$s', 'elementor' ),
			'<br>',
			$intro_text_link
		);

		$content_data = [
			'export' => [
				'title' => __( 'Export a Template Kit', 'elementor' ),
				'button' => [
					'url' => Plugin::$instance->app->get_base_url() . '#/export',
					'text' => __( 'Start Export', 'elementor' ),
				],
				'description' => __( 'Bundle your whole site - or just some of its elements - to be used for another website.', 'elementor' ),
				'link' => [
					'url' => 'https://go.elementor.com/wp-dash-import-export-export-flow',
					'text' => __( 'Learn More', 'elementor' ),
				],
			],
			'import' => [
				'title' => __( 'Import a Template Kit', 'elementor' ),
				'button' => [
					'url' => Plugin::$instance->app->get_base_url() . '#/import',
					'text' => __( 'Start Import', 'elementor' ),
				],
				'description' => __( 'Apply the design and settings of another site to this one.', 'elementor' ),
				'link' => [
					'url' => 'https://go.elementor.com/wp-dash-import-export-import-flow',
					'text' => __( 'Learn More', 'elementor' ),
				],
			],
		];

		$info_text = __( 'Even after you import and apply a Template Kit, you can undo it by restoring a previous version of your site.', 'elementor' ) . '<br>' . __( 'Open Site Settings > History > Revisions.', 'elementor' );
		?>

		<div class="tab-import-export-kit__content">
			<p class="tab-import-export-kit__info"><?php echo $intro_text; ?></p>

			<div class="tab-import-export-kit__wrapper">
			<?php foreach ( $content_data as $data ) { ?>
				<div class="tab-import-export-kit__container">
					<div class="tab-import-export-kit__box">
						<h2><?php echo $data['title']; ?></h2>
						<a href="<?php echo $data['button']['url']; ?>" class="elementor-button elementor-button-success">
							<?php echo $data['button']['text']; ?>
						</a>
					</div>
					<p><?php echo $data['description']; ?></p>
					<a href="<?php echo $data['link']['url']; ?>" target="_blank"><?php echo $data['link']['text']; ?></a>
				</div>
			<?php } ?>
			</div>

			<p class="tab-import-export-kit__info"><?php echo $info_text; ?></p>
		</div>
		<?php
	}

	public function register_settings_tab( Tools $tools ) {
		$tools->add_tab( 'import-export-kit', [
			'label' => __( 'Import / Export Kit', 'elementor' ),
			'sections' => [
				'intro' => [
					'label' => __( 'Template Kits', 'elementor' ),
					'callback' => function() {
						$this->render_import_export_tab_content();
					},
					'fields' => [],
				],
			],
		] );
	}

	public function __construct() {
		add_action( 'elementor/init', function() {
			$this->on_elementor_init();
		} );

		add_action( 'admin_init', function() {
			$this->on_admin_init();
		} );

		$page_id = Tools::PAGE_ID;

		add_action( "elementor/admin/after_create_settings/{$page_id}", [ $this, 'register_settings_tab' ] );
	}
}
