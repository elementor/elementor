<?php
namespace Elementor\TemplateLibrary;

use Elementor\Controls_Manager;
use Elementor\DB;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Source_Local extends Source_Base {

	const CPT = 'elementor_library';
	const TAXONOMY_TYPE_SLUG = 'elementor_library_type';

	const TYPE_META_KEY = '_elementor_template_type';

	public static function get_template_types() {
		return [
			'page',
			'section',
		];
	}

	public function get_id() {
		return 'local';
	}

	public function get_title() {
		return __( 'Local', 'elementor' );
	}

	public function register_data() {
		$labels = [
			'name' => _x( 'My Library', 'Template Library', 'elementor' ),
			'singular_name' => _x( 'Template', 'Template Library', 'elementor' ),
			'add_new' => _x( 'Add New', 'Template Library', 'elementor' ),
			'add_new_item' => _x( 'Add New Template', 'Template Library', 'elementor' ),
			'edit_item' => _x( 'Edit Template', 'Template Library', 'elementor' ),
			'new_item' => _x( 'New Template', 'Template Library', 'elementor' ),
			'all_items' => _x( 'All Templates', 'Template Library', 'elementor' ),
			'view_item' => _x( 'View Template', 'Template Library', 'elementor' ),
			'search_items' => _x( 'Search Template', 'Template Library', 'elementor' ),
			'not_found' => _x( 'No Templates found', 'Template Library', 'elementor' ),
			'not_found_in_trash' => _x( 'No Templates found in Trash', 'Template Library', 'elementor' ),
			'parent_item_colon' => '',
			'menu_name' => _x( 'My Library', 'Template Library', 'elementor' ),
		];

		$args = [
			'labels' => $labels,
			'public' => true,
			'rewrite' => false,
			'show_ui' => true,
			'show_in_menu' => false,
			'capability_type' => 'post',
			'hierarchical' => false,
			'supports' => [ 'title', 'thumbnail', 'author', 'elementor' ],
		];

		register_post_type(
			self::CPT,
			apply_filters( 'elementor/template_library/sources/local/register_post_type_args', $args )
		);

		$args = [
			'hierarchical' => false,
			'show_ui' => false,
			'show_in_nav_menus' => false,
			'show_admin_column' => true,
			'query_var' => is_admin(),
			'rewrite' => false,
			'public' => false,
			'label' => _x( 'Type', 'Template Library', 'elementor' ),
		];

		register_taxonomy(
			self::TAXONOMY_TYPE_SLUG,
			self::CPT,
			apply_filters( 'elementor/template_library/sources/local/register_taxonomy_args', $args )
		);
	}

	public function register_admin_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			__( 'My Library', 'elementor' ),
			__( 'My Library', 'elementor' ),
			'edit_pages',
			'edit.php?post_type=' . self::CPT
		);
	}

	public function get_items() {
		$templates_query = new \WP_Query(
			[
				'post_type' => self::CPT,
				'post_status' => 'publish',
				'posts_per_page' => -1,
				'orderby' => 'title',
				'order' => 'ASC',
			]
		);

		$templates = [];
		if ( $templates_query->have_posts() ) {
			foreach ( $templates_query->get_posts() as $post ) {
				$templates[] = $this->get_item( $post->ID );
			}
		}
		return $templates;
	}

	public function save_item( $template_data ) {
		if ( ! empty( $template_data['type'] ) && ! in_array( $template_data['type'], self::get_template_types() ) ) {
			return new \WP_Error( 'save_error', 'The specified template type doesn\'t exists' );
		}

		$post_id = wp_insert_post(
			[
				'post_title' => ! empty( $template_data['title'] ) ? $template_data['title'] : __( '(no title)', 'elementor' ),
				'post_status' => 'publish',
				'post_type' => self::CPT,
			]
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		Plugin::instance()->db->save_builder( $post_id, $template_data['data'] );
		Plugin::instance()->db->set_edit_mode( $post_id );

		update_post_meta( $post_id, self::TYPE_META_KEY, $template_data['type'] );
		wp_set_object_terms( $post_id, $template_data['type'], self::TAXONOMY_TYPE_SLUG );

		return $post_id;
	}

	/**
	 * @param int $item_id
	 *
	 * @return array
	 */
	public function get_item( $item_id ) {
		$post = get_post( $item_id );

		$user = get_user_by( 'id', $post->post_author );

		return [
			'template_id' => $post->ID,
			'source' => $this->get_id(),
			'type' => get_post_meta( $post->ID, self::TYPE_META_KEY, true ),
			'title' => $post->post_title,
			'thumbnail' => get_the_post_thumbnail_url( $post ),
			'date' => mysql2date( get_option( 'date_format' ), $post->post_date ),
			'author' => $user->display_name,
			'categories' => [],
			'keywords' => [],
			'export_link' => $this->_get_export_link( $item_id ),
			'url' => get_permalink( $post->ID ),
		];
	}

	public function get_content( $item_id, $context = 'display' ) {
		// TODO: Valid the data (in JS too!)
		if ( 'display' === $context ) {
			$data = Plugin::instance()->db->get_builder( $item_id );
		} else {
			$data = Plugin::instance()->db->get_plain_builder( $item_id );
		}

		return Plugin::instance()->db->iterate_data( $data, function( $element ) {
			$element['id'] = Utils::generate_random_string();
			return $element;
		} );
	}

	public function delete_template( $item_id ) {
		wp_delete_post( $item_id, true );
	}

	public function export_template( $item_id ) {
		$template_data = $this->get_content( $item_id, 'raw' );
		if ( empty( $template_data ) )
			return new \WP_Error( '404', 'The template does not exist' );

		// TODO: More fields to export?
		$export_data = [
			'version' => DB::DB_VERSION,
			'title' => get_the_title( $item_id ),
			'type' => get_post_meta( $item_id, self::TYPE_META_KEY, true ),
			'data' => $template_data,
		];

		$filename = 'elementor-' . $item_id . '-' . date( 'Y-m-d' ) . '.json';
		$template_contents = wp_json_encode( $export_data );
		$filesize = strlen( $template_contents );

		// Headers to prompt "Save As"
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename=' . $filename );
		header( 'Expires: 0' );
		header( 'Cache-Control: must-revalidate' );
		header( 'Pragma: public' );
		header( 'Content-Length: ' . $filesize );

		// Clear buffering just in case
		@ob_end_clean();
		flush();

		// Output file contents
		echo $template_contents;
		die;
	}

	public function import_template() {
		$import_file = $_FILES['file']['tmp_name'];

		if ( empty( $import_file ) )
			return new \WP_Error( 'file_error', 'Please upload a file to import' );

		$content = json_decode( file_get_contents( $import_file ), true );
		$is_invalid_file = empty( $content ) || empty( $content['data'] ) || ! is_array( $content['data'] );

		if ( $is_invalid_file )
			return new \WP_Error( 'file_error', 'Invalid File' );

		// Fetch all images and replace to new
		$import_images = new Classes\Import_Images();

		$content_data = Plugin::instance()->db->iterate_data( $content['data'], function( $element ) use ( $import_images ) {
			if ( 'widget' === $element['elType'] ) {
				$obj = Plugin::instance()->widgets_manager->get_widget( $element['widgetType'] );
			} else {
				$obj = Plugin::instance()->elements_manager->get_element( $element['elType'] );
			}

			if ( ! $obj )
				return $element;

			foreach ( $obj->get_controls() as $control ) {
				if ( Controls_Manager::MEDIA === $control['type'] ) {
					if ( empty( $element['settings'][ $control['name'] ]['url'] ) )
						continue;

					$imported_image = $import_images->import( $element['settings'][ $control['name'] ] );

					if ( ! $imported_image ) {
						$element['settings'][ $control['name'] ] = [
							'id' => null,
							'url' => Utils::get_placeholder_image_src(),
						];

						continue;
					}

					$element['settings'][ $control['name'] ] = $import_images->import( $element['settings'][ $control['name'] ] );
				}

				if ( Controls_Manager::GALLERY === $control['type'] ) {
					foreach ( $element['settings'][ $control['name'] ] as &$attachment ) {
						if ( empty( $attachment['url'] ) )
							continue;

						$attachment = $import_images->import( $attachment );
					}
				}
			}

			return $element;
		} );

		$item_id = $this->save_item( [
			'data' => $content_data,
			'title' => $content['title'],
			'type' => $content['type'],
		] );

		if ( is_wp_error( $item_id ) )
			return $item_id;

		return $this->get_item( $item_id );
	}

	public function post_row_actions( $actions, \WP_Post $post ) {
		if ( $this->_is_base_templates_screen() ) {
			$actions['export-template'] = sprintf( '<a href="%s">%s</a>', $this->_get_export_link( $post->ID ), __( 'Export Template', 'elementor' ) );
			unset( $actions['inline hide-if-no-js'] );
		}

		return $actions;
	}

	public function admin_import_template_form() {
		if ( ! $this->_is_base_templates_screen() ) {
			return;
		}
		?>
		<div id="elementor-hidden-area">
			<a id="elementor-import-template-trigger" class="page-title-action"><?php _e( 'Import Template', 'elementor' ); ?></a>
			<div id="elementor-import-template-area">
				<div id="elementor-import-template-title"><?php _e( 'Choose an Elementor template JSON file, and add it to the list of templates available in your library.', 'elementor' ); ?></div>
				<form id="elementor-import-template-form" method="post" action="<?php echo admin_url( 'admin-ajax.php' ); ?>" enctype="multipart/form-data">
					<input type="hidden" name="action" value="elementor_import_template">
					<fieldset id="elementor-import-template-form-inputs">
						<input type="file" name="file" accept="application/json" required>
						<input type="submit" class="button" value="<?php _e( 'Import Now', 'elementor' ); ?>">
					</fieldset>
				</form>
			</div>
		</div>
		<?php
	}

	public function block_template_frontend() {
		if ( is_singular( self::CPT ) && ! User::is_current_user_can_edit() ) {
			wp_redirect( site_url(), 301 );
			die;
		}
	}

	public function __construct() {
		parent::__construct();

		$this->_add_actions();
	}

	private function _is_base_templates_screen() {
		global $current_screen;

		if ( ! $current_screen ) {
			return false;
		}

		return 'edit' === $current_screen->base && self::CPT === $current_screen->post_type;
	}

	private function _get_export_link( $item_id ) {
		return add_query_arg(
			[
				'action' => 'elementor_export_template',
				'source' => $this->get_id(),
				'template_id' => $item_id,
			],
			admin_url( 'admin-ajax.php' )
		);
	}

	private function _add_actions() {
		if ( is_admin() ) {
			add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 50 );
			add_filter( 'post_row_actions', [ $this, 'post_row_actions' ], 10, 2 );
			add_action( 'admin_footer', [ $this, 'admin_import_template_form' ] );
		}

		add_action( 'template_redirect', [ $this, 'block_template_frontend' ] );
	}
}
