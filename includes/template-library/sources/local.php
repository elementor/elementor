<?php
namespace Elementor\TemplateLibrary;

use Elementor\DB;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Source_Local extends Source_Base {

	const CPT = 'elementor_library';

	const TAXONOMY_TYPE_SLUG = 'elementor_library_type';

	const TYPE_META_KEY = '_elementor_template_type';

	private static $_template_types = [ 'page', 'section' ];

	public static function get_template_type( $template_id ) {
		return get_post_meta( $template_id, self::TYPE_META_KEY, true );
	}

	public static function is_base_templates_screen() {
		global $current_screen;

		if ( ! $current_screen ) {
			return false;
		}

		return 'edit' === $current_screen->base && self::CPT === $current_screen->post_type;
	}

	public static function add_template_type( $type ) {
		self::$_template_types[] = $type;
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
			'show_in_nav_menus' => false,
			'exclude_from_search' => true,
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

	public function get_items( $args = [] ) {
		$templates_query = new \WP_Query(
			[
				'post_type' => self::CPT,
				'post_status' => 'publish',
				'posts_per_page' => -1,
				'orderby' => 'title',
				'order' => 'ASC',
				'meta_query' => [
					[
						'key' => self::TYPE_META_KEY,
						'value' => self::$_template_types,
					],
				],
			]
		);

		$templates = [];

		if ( $templates_query->have_posts() ) {
			foreach ( $templates_query->get_posts() as $post ) {
				$templates[] = $this->get_item( $post->ID );
			}
		}

		if ( ! empty( $args ) ) {
			$templates = wp_list_filter( $templates, $args );
		}

		return $templates;
	}

	public function save_item( $template_data ) {
	    if ( ! in_array( $template_data['type'], self::$_template_types ) ) {
			return new \WP_Error( 'save_error', 'Invalid template type `' . $template_data['type'] . '`' );
		}

		$template_id = wp_insert_post( [
			'post_title' => ! empty( $template_data['title'] ) ? $template_data['title'] : __( '(no title)', 'elementor' ),
			'post_status' => 'publish',
			'post_type' => self::CPT,
		] );

		if ( is_wp_error( $template_id ) ) {
			return $template_id;
		}

		Plugin::$instance->db->set_edit_mode( $template_id );

		Plugin::$instance->db->save_editor( $template_id, $template_data['data'] );

		$this->save_item_type( $template_id, $template_data['type'] );

		do_action( 'elementor/template-library/after_save_template', $template_id, $template_data );

		do_action( 'elementor/template-library/after_update_template', $template_id, $template_data );

		return $template_id;
	}

	public function update_item( $new_data ) {
		Plugin::$instance->db->save_editor( $new_data['id'], $new_data['data'] );

		do_action( 'elementor/template-library/after_update_template', $new_data['id'], $new_data );

		return true;
	}

	/**
	 * @param int $item_id
	 *
	 * @return array
	 */
	public function get_item( $item_id ) {
		$post = get_post( $item_id );

		$user = get_user_by( 'id', $post->post_author );

		$data = [
			'template_id' => $post->ID,
			'source' => $this->get_id(),
			'type' => self::get_template_type( $post->ID ),
			'title' => $post->post_title,
			'thumbnail' => get_the_post_thumbnail_url( $post ),
			'date' => mysql2date( get_option( 'date_format' ), $post->post_date ),
			'author' => $user->display_name,
			'categories' => [],
			'keywords' => [],
			'export_link' => $this->_get_export_link( $item_id ),
			'url' => get_permalink( $post->ID ),
		];

		return apply_filters( 'elementor/template-library/get_template', $data );
	}

	public function get_content( $item_id, $context = 'display' ) {
		$db = Plugin::$instance->db;

		// TODO: Validate the data (in JS too!)
		if ( 'display' === $context ) {
			$data = $db->get_builder( $item_id );
		} else {
			$data = $db->get_plain_editor( $item_id );
		}

		$data = $this->replace_elements_ids( $data );

		return $data;
	}

	public function delete_template( $item_id ) {
		wp_delete_post( $item_id, true );
	}

	public function export_template( $item_id ) {
		$template_data = $this->get_content( $item_id, 'raw' );

		$template_data = $this->process_export_import_data( $template_data, 'on_export' );

		if ( empty( $template_data ) )
			return new \WP_Error( '404', 'The template does not exist' );

		// TODO: More fields to export?
		$export_data = [
			'version' => DB::DB_VERSION,
			'title' => get_the_title( $item_id ),
			'type' => self::get_template_type( $item_id ),
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

		$content_data = $this->process_export_import_data( $content['data'], 'on_import' );

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
		if ( self::is_base_templates_screen() ) {
			if ( $this->is_template_supports_export( $post->ID ) ) {
				$actions['export-template'] = sprintf( '<a href="%s">%s</a>', $this->_get_export_link( $post->ID ), __( 'Export Template', 'elementor' ) );
			}

			unset( $actions['inline hide-if-no-js'] );
		}

		return $actions;
	}

	public function admin_import_template_form() {
		if ( ! self::is_base_templates_screen() ) {
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

	public function is_template_supports_export( $template_id ) {
		return apply_filters( 'elementor/template_library/is_template_supports_export', true, $template_id );
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

	public function on_save_post( $post_id, $post ) {
		if ( self::CPT !== $post->post_type ) {
			return;
		}

		if ( self::get_template_type( $post_id ) ) { // It's already with a type
			return;
		}

		$this->save_item_type( $post_id, 'page' );
	}

	private function save_item_type( $post_id, $type ) {
		update_post_meta( $post_id, self::TYPE_META_KEY, $type );

		wp_set_object_terms( $post_id, $type, self::TAXONOMY_TYPE_SLUG );
	}

	/**
	 * @param $query \WP_Query
	 */
	public function admin_query_filter_types( $query ) {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}

		$library_screen_id = 'edit-' . self::CPT;
		$current_screen = get_current_screen();

		if ( ! isset( $current_screen->id ) || $library_screen_id !== $current_screen->id ) {
			return;
		}

		$query->query_vars['meta_key'] = self::TYPE_META_KEY;
		$query->query_vars['meta_value'] = self::$_template_types;
	}

	private function _add_actions() {
		if ( is_admin() ) {
			add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 50 );
			add_filter( 'post_row_actions', [ $this, 'post_row_actions' ], 10, 2 );
			add_action( 'admin_footer', [ $this, 'admin_import_template_form' ] );
			add_action( 'save_post', [ $this, 'on_save_post' ], 10, 2 );
			add_action( 'parse_query', [ $this, 'admin_query_filter_types' ] );
		}

		add_action( 'template_redirect', [ $this, 'block_template_frontend' ] );
	}

	public function __construct() {
		parent::__construct();

		$this->_add_actions();
	}
}
