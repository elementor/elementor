<?php
namespace Elementor\Templates;

use Elementor\Controls_Manager;
use Elementor\DB;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Type_Local extends Type_Base {

	const CPT = 'elementor_library';

	public function get_id() {
		return 'local';
	}

	public function get_title() {
		return __( 'Local', 'elementor' );
	}

	public function register_data() {
		$labels = [
			'name' => __( 'Library', 'elementor' ),
			'singular_name' => __( 'Template', 'elementor' ),
			'add_new' => __( 'Add New', 'elementor' ),
			'add_new_item' => __( 'Add New Template', 'elementor' ),
			'edit_item' => __( 'Edit Template', 'elementor' ),
			'new_item' => __( 'New Template', 'elementor' ),
			'all_items' => __( 'All Templates', 'elementor' ),
			'view_item' => __( 'View Template', 'elementor' ),
			'search_items' => __( 'Search Template', 'elementor' ),
			'not_found' => __( 'No Templates found', 'elementor' ),
			'not_found_in_trash' => __( 'No Templates found in Trash', 'elementor' ),
			'parent_item_colon' => '',
			'menu_name' => __( 'Library', 'elementor' ),
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
			apply_filters( 'elementor/templates/types/local/register_post_type_args', $args )
		);
	}

	public function register_admin_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			__( 'Library', 'elementor' ),
			__( 'Library', 'elementor' ),
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

	public function save_item( $template_data = [], $template_title = '' ) {
		$post_id = wp_insert_post(
			[
				'post_title' => ! empty( $template_title ) ? $template_title : __( '(no title)', 'elementor' ),
				'post_status' => 'publish',
				'post_type' => self::CPT,
			]
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		Plugin::instance()->db->save_builder( $post_id, $template_data );

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
			'id' => $post->ID,
			'type' => $this->get_id(),
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
			wp_die( 'The template does not exist', 'elementor' );

		// TODO: More fields to export?
		$export_data = [
			'version' => DB::DB_VERSION,
			'title' => get_the_title( $item_id ),
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

		$template_title = isset( $content['title'] ) ? $content['title'] : '';
		$item_id = $this->save_item( $content_data, $template_title );

		if ( is_wp_error( $item_id ) )
			return new \WP_Error( 'save_error', $item_id->get_error_message() );

		return $this->get_item( $item_id );
	}

	public function post_row_actions( $actions, \WP_Post $post ) {
		if ( $this->_is_base_templates_screen() ) {
			$actions[] = sprintf( '<a href="%s">%s</a>', $this->_get_export_link( $post->ID ), __( 'Export Template', 'elementor' ) );
		}

		return $actions;
	}

	public function admin_import_template_form() {
		if ( ! $this->_is_base_templates_screen() ) {
			return;
		}
		?>
		<div id="elementor-hidden-area">
			<a id="elementor-import-templates-trigger" class="page-title-action"><?php _e( 'Import Template', 'elementor' ); ?></a>
			<div id="elementor-import-templates-area">
				<div id="elementor-import-templates-title"><?php _e( 'Choose an Elementor template JSON file, and add it to the list of templates available in your library.', 'elementor' ); ?></div>
				<form id="elementor-import-templates-form" method="post" action="<?php echo admin_url( 'admin-ajax.php' ); ?>" enctype="multipart/form-data">
					<input type="hidden" name="action" value="elementor_import_template">
					<fieldset id="elementor-import-templates-form-inputs">
						<input type="file" name="file" accept="application/json" required>
						<input type="submit" class="button" value="Import">
					</fieldset>
				</form>
			</div>
		</div>
		<?php
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
				'type' => $this->get_id(),
				'item_id' => $item_id,
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
	}
}
