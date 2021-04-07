<?php
namespace Elementor\Core\App\Modules\ImportExport;

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
				wp_die( $error->getMessage() );
			}
		}
	}

	private function render_temp_import_export_content() {
		$intro_text_link = sprintf( '<a href="#">%s</a>', __( 'Learn more', 'elementor' ) );

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
					'url' => '#',
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
					'url' => '#',
					'text' => __( 'Learn More', 'elementor' ),
				],
			],
		];

		$info_text_link = sprintf( '<a href="#">%s</a>', __( 'Click here.', 'elementor' ) );

		$info_text = sprintf(
		/* translators: %s: Click here. */
			__( 'Even after you import and apply a Template Kit, you can undo it by restoring a previous version of your site. %s', 'elementor' ),
			$info_text_link
		);
		?>
		<style>
			#tab-import-export-kit.elementor-active ~ p.submit {
				display: none;
			}

			.tab-import-export-kit__wrapper {
				margin: 40px 0;
				max-width: 700px;
			}

			.tab-import-export-kit__container {
				background-color: white;
				font-size: 16px;
				margin-top: 40px;
				padding: 30px;
			}

			.tab-import-export-kit__container:not(:first-child) {
				margin-top: 5px;
			}

			.tab-import-export-kit__box {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
			}

			.tab-import-export-kit__box h2 {
				color: #6D7882;
				font-size: 28px;
				font-weight: normal;
				line-height: 1;
				margin: 0;
			}

			.tab-import-export-kit__box .elementor-button.elementor-button-success {
				font-weight: bold;
				padding: 8px 16px;
				text-transform: initial;
				text-decoration: none;
			}

			.tab-import-export-kit__container p {
				color: #A4AFB7;
				font-size: 16px;
				margin: 20px 0 25px;
			}

			.tab-import-export-kit__info {
				font-size: 14px;
			}

			.tab-import-export-kit__container a,
			.tab-import-export-kit__info a {
				color: #58d0f5;
				text-decoration: underline;
			}
		</style>

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
					<a href="<?php echo $data['button']['url']; ?>"><?php echo $data['link']['text']; ?></a>
				</div>
			<?php } ?>
		</div>

		<p class="tab-import-export-kit__info"><?php echo $info_text; ?></p>
		<?php
	}

	public function register_settings_tab( Tools $tools ) {
		$tools->add_tab( 'import-export-kit', [
			'label' => __( 'Import / Export Kit', 'elementor' ),
			'sections' => [
				'intro' => [
					'label' => __( 'Template Kits', 'elementor' ),
					'callback' => function() {
						$this->render_temp_import_export_content();
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
