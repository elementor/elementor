<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Plugin;
use Elementor\Settings;
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
		$export_nonce = wp_create_nonce( 'elementor_export' );
		$export_url = add_query_arg( [ 'nonce' => $export_nonce ], Plugin::$instance->app->get_base_url() );

		return [
			'exportURL' => $export_url,
		];
	}

	private function on_elementor_init() {
		if ( isset( $_POST['action'] ) && self::IMPORT_TRIGGER_KEY === $_POST['action'] ) {
			if ( ! wp_verify_nonce( $_POST['nonce'], Ajax::NONCE_KEY ) ) {
				return;
			}

			try {
				$import_settings = json_decode( stripslashes( $_POST['data'] ), true );

				$import_settings['file_name'] = $_FILES['e_import_file']['tmp_name'];

				$this->import = new Import( $import_settings );

				$result = $this->import->run();

				wp_send_json_success( $result );
			} catch ( \Error $error ) {
				wp_send_json_error( $error->getMessage() );
			}
		}

		if ( isset( $_GET[ self::EXPORT_TRIGGER_KEY ] ) ) {
			if ( ! wp_verify_nonce( $_GET['nonce'], 'elementor_export' ) ) {
				return;
			}

			$export_settings = $_GET[ self::EXPORT_TRIGGER_KEY ];

			try {
				$this->export = new Export( self::merge_properties( [], $export_settings, [ 'include' ] ) );

				$this->export->run();
			} catch ( \Error $error ) {
				// PHPCS - Not user input.
				wp_die( $error->getMessage() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
		}
	}

	private function render_import_export_tab_content() {
		$intro_text_link = sprintf( '<a href="https://go.elementor.com/wp-dash-import-export-general" target="_blank">%s</a>', esc_html__( 'Learn more', 'elementor' ) );

		$intro_text = sprintf(
		/* translators: %1$s: New line break, %2$s: Learn More link. */
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

		$info_text = esc_html__( 'Even after you import and apply a Template Kit, you can undo it by restoring a previous version of your site.', 'elementor' ) . '<br>' . esc_html__( 'Open Site Settings > History > Revisions.', 'elementor' );
		?>

		<div class="tab-import-export-kit__content">
			<p class="tab-import-export-kit__info"><?php Utils::print_unescaped_internal_string( $intro_text ); ?></p>

			<div class="tab-import-export-kit__wrapper">
			<?php foreach ( $content_data as $data ) { ?>
				<div class="tab-import-export-kit__container">
					<div class="tab-import-export-kit__box">
						<h2><?php Utils::print_unescaped_internal_string( $data['title'] ); ?></h2>
						<a href="<?php echo esc_url( $data['button']['url'] ); ?>" class="elementor-button elementor-button-success">
							<?php Utils::print_unescaped_internal_string( $data['button']['text'] ); ?>
						</a>
					</div>
					<p><?php Utils::print_unescaped_internal_string( $data['description'] ); ?></p>
					<a href="<?php echo esc_url( $data['link']['url'] ); ?>" target="_blank"><?php Utils::print_unescaped_internal_string( $data['link']['text'] ); ?></a>
				</div>
			<?php } ?>
			</div>

			<p class="tab-import-export-kit__info"><?php Utils::print_unescaped_internal_string( $info_text ); ?></p>
		</div>
		<?php
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
		add_action( 'elementor/init', function() {
			$this->on_elementor_init();
		} );

		$page_id = Tools::PAGE_ID;

		add_action( "elementor/admin/after_create_settings/{$page_id}", [ $this, 'register_settings_tab' ] );
	}
}
