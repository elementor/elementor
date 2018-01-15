<?php
namespace Elementor\TemplateLibrary;

use Elementor\DB;
use Elementor\Core\Settings\Page\Manager as PageSettingsManager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Core\Settings\Page\Model;
use Elementor\Editor;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Local extends Source_Base {

	const CPT = 'elementor_library';

	const TAXONOMY_TYPE_SLUG = 'elementor_library_type';

	const TYPE_META_KEY = '_elementor_template_type';

	const TEMP_FILES_DIR = 'elementor/tmp';

	const BULK_EXPORT_ACTION = 'elementor_export_multiple_templates';

	private static $_template_types = [ 'page', 'section' ];

	private $post_type_object;

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_template_type( $template_id ) {
		return get_post_meta( $template_id, self::TYPE_META_KEY, true );
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function is_base_templates_screen() {
		global $current_screen;

		if ( ! $current_screen ) {
			return false;
		}

		return 'edit' === $current_screen->base && self::CPT === $current_screen->post_type;
	}

	/**
	 * @static
	 * @since 1.0.3
	 * @access public
	 */
	public static function add_template_type( $type ) {
		self::$_template_types[] = $type;
	}

	/**
	 * @static
	 * @since 1.8.0
	 * @access public
	 */
	public static function remove_template_type( $type ) {
		$key = array_search( $type, self::$_template_types, true );
		if ( false !== $key ) {
			unset( self::$_template_types[ $key ] );
		}
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_id() {
		return 'local';
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_title() {
		return __( 'Local', 'elementor' );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
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

		/**
		 * Register template library post type args.
		 *
		 * Filters the post type arguments when registering elementor template library post type.
		 *
		 * @since 1.0.0
		 *
		 * @param array $args Arguments for registering a post type.
		 */
		$args = apply_filters( 'elementor/template_library/sources/local/register_post_type_args', $args );

		$this->post_type_object = register_post_type( self::CPT, $args );

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

		/**
		 * Register template library taxonomy args.
		 *
		 * Filters the taxonomy arguments when registering elementor template library taxonomy.
		 *
		 * @since 1.0.0
		 *
		 * @param array $args Arguments for registering a taxonomy.
		 */
		$args = apply_filters( 'elementor/template_library/sources/local/register_taxonomy_args', $args );

		register_taxonomy( self::TAXONOMY_TYPE_SLUG, self::CPT, $args );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function register_admin_menu() {
		if ( current_user_can( 'manage_options' ) ) {
			add_submenu_page(
				Settings::PAGE_ID,
				_x( 'My Library', 'Template Library', 'elementor' ),
				_x( 'My Library', 'Template Library', 'elementor' ),
				Editor::EDITING_CAPABILITY,
				'edit.php?post_type=' . self::CPT
			);
		} else {
			add_menu_page(
				__( 'Elementor', 'elementor' ),
				__( 'Elementor', 'elementor' ),
				Editor::EDITING_CAPABILITY,
				'edit.php?post_type=' . self::CPT,
				'',
				'',
				99
			);
		}
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
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

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function save_item( $template_data ) {
		if ( ! in_array( $template_data['type'], self::$_template_types ) ) {
			return new \WP_Error( 'save_error', 'Invalid template type `' . $template_data['type'] . '`' );
		}

		if ( ! current_user_can( $this->post_type_object->cap->edit_posts ) ) {
			return new \WP_Error( 'save_error', __( 'Access Denied.', 'elementor' ) );
		}

		$template_id = wp_insert_post( [
			'post_title' => ! empty( $template_data['title'] ) ? $template_data['title'] : __( '(no title)', 'elementor' ),
			'post_status' => current_user_can( 'publish_posts' ) ? 'publish' : 'pending',
			'post_type' => self::CPT,
		] );

		if ( is_wp_error( $template_id ) ) {
			return $template_id;
		}

		Plugin::$instance->db->set_is_elementor_page( $template_id );

		Plugin::$instance->db->save_editor( $template_id, $template_data['content'] );

		$this->save_item_type( $template_id, $template_data['type'] );

		if ( ! empty( $template_data['page_settings'] ) ) {
			SettingsManager::get_settings_managers( 'page' )->save_settings( $template_data['page_settings'], $template_id );
		}

		/**
		 * After template library save.
		 *
		 * Fires after Elementor template library was saved.
		 *
		 * @since 1.0.1
		 *
		 * @param int   $template_id   The ID of the template.
		 * @param array $template_data The template data.
		 */
		do_action( 'elementor/template-library/after_save_template', $template_id, $template_data );

		/**
		 * After template library update.
		 *
		 * Fires after Elementor template library was updated.
		 *
		 * @since 1.0.1
		 *
		 * @param int   $template_id   The ID of the template.
		 * @param array $template_data The template data.
		 */
		do_action( 'elementor/template-library/after_update_template', $template_id, $template_data );

		return $template_id;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function update_item( $new_data ) {
		if ( ! current_user_can( $this->post_type_object->cap->edit_post, $new_data['id'] ) ) {
			return new \WP_Error( 'save_error', __( 'Access Denied.', 'elementor' ) );
		}

		Plugin::$instance->db->save_editor( $new_data['id'], $new_data['content'] );

		/**
		 * After template library update.
		 *
		 * Fires after Elementor template library was updated.
		 *
		 * @since 1.0.0
		 *
		 * @param int   $new_data_id The ID of the new template.
		 * @param array $new_data    The new template data.
		 */
		do_action( 'elementor/template-library/after_update_template', $new_data['id'], $new_data );

		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	 * @param int $template_id
	 *
	 * @return array
	 */
	public function get_item( $template_id ) {
		$post = get_post( $template_id );

		$user = get_user_by( 'id', $post->post_author );

		$page_settings = get_post_meta( $post->ID, PageSettingsManager::META_KEY, true );

		$date = strtotime( $post->post_date );

		$data = [
			'template_id' => $post->ID,
			'source' => $this->get_id(),
			'type' => self::get_template_type( $post->ID ),
			'title' => $post->post_title,
			'thumbnail' => get_the_post_thumbnail_url( $post ),
			'date' => $date,
			'human_date' => date_i18n( get_option( 'date_format' ), $date ),
			'author' => $user->display_name,
			'hasPageSettings' => ! empty( $page_settings ),
			'tags' => [],
			'export_link' => $this->_get_export_link( $template_id ),
			'url' => get_permalink( $post->ID ),
		];

		/**
		 * Get template library template.
		 *
		 * Filters the elementor template data when loading template library item.
		 *
		 * @since 1.0.0
		 *
		 * @param array $data Arguments for registering a taxonomy.
		 */
		$data = apply_filters( 'elementor/template-library/get_template', $data );

		return $data;
	}

	/**
	 * @since 1.5.0
	 * @access public
	*/
	public function get_data( array $args ) {
		$db = Plugin::$instance->db;

		$template_id = $args['template_id'];

		// TODO: Validate the data (in JS too!).
		if ( ! empty( $args['display'] ) ) {
			$content = $db->get_builder( $template_id );
		} else {
			$content = $db->get_plain_editor( $template_id );
		}

		if ( ! empty( $content ) ) {
			$content = $this->replace_elements_ids( $content );
		}

		$data = [
			'content' => $content,
		];

		if ( ! empty( $args['page_settings'] ) ) {
			$page = SettingsManager::get_settings_managers( 'page' )->get_model( $args['template_id'] );

			$data['page_settings'] = $page->get_data( 'settings' );
		}

		return $data;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function delete_template( $template_id ) {
		if ( ! current_user_can( $this->post_type_object->cap->delete_post, $template_id ) ) {
			return new \WP_Error( 'template_error', __( 'Access Denied.', 'elementor' ) );
		}

		return wp_delete_post( $template_id, true );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function export_template( $template_id ) {
		$file_data = $this->prepare_template_export( $template_id );

		if ( is_wp_error( $file_data ) ) {
			return $file_data;
		}

		$this->send_file_headers( $file_data['name'], strlen( $file_data['content'] ) );

		// Clear buffering just in case.
		@ob_end_clean();

		flush();

		// Output file contents.
		echo $file_data['content'];

		die;
	}

	/**
	 * @since 1.6.0
	 * @access public
	*/
	public function export_multiple_templates( array $template_ids ) {
		$files = [];

		$wp_upload_dir = wp_upload_dir();

		$temp_path = $wp_upload_dir['basedir'] . '/' . self::TEMP_FILES_DIR;

		/*
		 * Create temp path if it doesn't exist
		 */
		wp_mkdir_p( $temp_path );

		/*
		 * Create all json files
		 */
		foreach ( $template_ids as $template_id ) {
			$file_data = $this->prepare_template_export( $template_id );

			if ( is_wp_error( $file_data ) ) {
				continue;
			}

			$complete_path = $temp_path . '/' . $file_data['name'];

			$put_contents = file_put_contents( $complete_path, $file_data['content'] );

			if ( ! $put_contents ) {
				return new \WP_Error( '404', 'Cannot create file ' . $file_data['name'] );
			}

			$files[] = [
				'path' => $complete_path,
				'name' => $file_data['name'],
			];
		}

		/*
		 * Create temporary .zip file
		 */
		$zip_archive_filename = 'elementor-templates-' . date( 'Y-m-d' ) . '.zip';

		$zip_archive = new \ZipArchive();

		$zip_complete_path = $temp_path . '/' . $zip_archive_filename;

		$zip_archive->open( $zip_complete_path, \ZipArchive::CREATE );

		foreach ( $files as $file ) {
			$zip_archive->addFile( $file['path'], $file['name'] );
		}

		$zip_archive->close();

		foreach ( $files as $file ) {
			unlink( $file['path'] );
		}

		$this->send_file_headers( $zip_archive_filename, filesize( $zip_complete_path ) );

		@ob_end_flush();

		@readfile( $zip_complete_path );

		unlink( $zip_complete_path );

		die;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function import_template() {
		$import_file = $_FILES['file']['tmp_name'];

		if ( empty( $import_file ) ) {
			return new \WP_Error( 'file_error', 'Please upload a file to import' );
		}

		$items = [];

		$file_extension = pathinfo( $_FILES['file']['name'], PATHINFO_EXTENSION );

		if ( 'zip' === $file_extension ) {
			if ( ! class_exists( '\ZipArchive' ) ) {
				return new \WP_Error( 'zip_error', 'PHP Zip extension not loaded.' );
			}

			$zip = new \ZipArchive();

			$wp_upload_dir = wp_upload_dir();

			$temp_path = $wp_upload_dir['basedir'] . '/' . self::TEMP_FILES_DIR . '/' . uniqid();

			$zip->open( $import_file );

			$zip->extractTo( $temp_path );

			$zip->close();

			$file_names = array_diff( scandir( $temp_path ), [ '.', '..' ] );

			foreach ( $file_names as $file_name ) {
				$full_file_name = $temp_path . '/' . $file_name;

				$items[] = $this->import_single_template( $full_file_name );

				unlink( $full_file_name );
			}

			rmdir( $temp_path );
		} else {
			$items[] = $this->import_single_template( $import_file );
		}

		return $items;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function post_row_actions( $actions, \WP_Post $post ) {
		if ( self::is_base_templates_screen() ) {
			if ( $this->is_template_supports_export( $post->ID ) ) {
				$actions['export-template'] = sprintf( '<a href="%s">%s</a>', $this->_get_export_link( $post->ID ), __( 'Export Template', 'elementor' ) );
			}

			unset( $actions['inline hide-if-no-js'] );
		}

		return $actions;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function admin_import_template_form() {
		if ( ! self::is_base_templates_screen() ) {
			return;
		}
		?>
		<div id="elementor-hidden-area">
			<a id="elementor-import-template-trigger" class="page-title-action"><?php esc_attr_e( 'Import Templates', 'elementor' ); ?></a>
			<div id="elementor-import-template-area">
				<div id="elementor-import-template-title"><?php esc_attr_e( 'Choose an Elementor template JSON file or a .zip archive of Elementor templates, and add them to the list of templates available in your library.', 'elementor' ); ?></div>
				<form id="elementor-import-template-form" method="post" action="<?php echo admin_url( 'admin-ajax.php' ); ?>" enctype="multipart/form-data">
					<input type="hidden" name="action" value="elementor_import_template">
					<input type="hidden" name="_nonce" value="<?php echo Plugin::$instance->editor->create_nonce( self::CPT ); ?>">
					<fieldset id="elementor-import-template-form-inputs">
						<input type="file" name="file" accept=".json,application/json,.zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed" required>
						<input type="submit" class="button" value="<?php esc_attr_e( 'Import Now', 'elementor' ); ?>">
					</fieldset>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function block_template_frontend() {
		if ( is_singular( self::CPT ) && ! current_user_can( 'edit_posts' ) ) {
			wp_redirect( site_url(), 301 );
			die;
		}
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function is_template_supports_export( $template_id ) {
		$export_support = true;

		/**
		 * Is template library supports export.
		 *
		 * Filters whether the template library supports export.
		 *
		 * @since 1.0.0
		 *
		 * @param bool $export_support Whether the template library supports export.
		 *                             Default is true.
		 * @param int  $template_id    Post ID.
		 */
		$export_support = apply_filters( 'elementor/template_library/is_template_supports_export', $export_support, $template_id );

		return $export_support;
	}

	/**
	 * @since 1.8.0
	 * @access public
	 */
	public function remove_elementor_post_state_from_library( $post_states, $post ) {
		if ( self::CPT === $post->post_type && isset( $post_states['elementor'] ) ) {
			unset( $post_states['elementor'] );
		}
		return $post_states;
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function _get_export_link( $template_id ) {
		return add_query_arg(
			[
				'action' => 'elementor_export_template',
				'source' => $this->get_id(),
				'_nonce' => Plugin::$instance->editor->create_nonce( self::CPT ),
				'template_id' => $template_id,
			],
			admin_url( 'admin-ajax.php' )
		);
	}

	/**
	 * @since 1.0.1
	 * @access public
	*/
	public function on_save_post( $post_id, $post ) {
		if ( self::CPT !== $post->post_type ) {
			return;
		}

		if ( self::get_template_type( $post_id ) ) { // It's already with a type
			return;
		}

		// Don't save type on import, the importer will do it.
		if ( did_action( 'import_start' ) ) {
			return;
		}

		$this->save_item_type( $post_id, 'page' );
	}

	/**
	 * @since 1.0.1
	 * @access private
	*/
	private function save_item_type( $post_id, $type ) {
		update_post_meta( $post_id, self::TYPE_META_KEY, $type );

		wp_set_object_terms( $post_id, $type, self::TAXONOMY_TYPE_SLUG );
	}

	/**
	 * @since 1.0.6
	 * @access public
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

	/**
	 * @since 1.6.0
	 * @access public
	*/
	public function admin_add_bulk_export_action( $actions ) {
		$actions[ self::BULK_EXPORT_ACTION ] = __( 'Export', 'elementor' );

		return $actions;
	}

	/**
	 * @since 1.6.0
	 * @access public
	*/
	public function admin_export_multiple_templates( $redirect_to, $action, $post_ids ) {
		if ( self::BULK_EXPORT_ACTION === $action ) {
			$this->export_multiple_templates( $post_ids );
		}

		return $redirect_to;
	}

	/**
	 * @since 1.6.0
	 * @access private
	*/
	private function import_single_template( $file_name ) {
		$data = json_decode( file_get_contents( $file_name ), true );

		if ( empty( $data ) ) {
			return new \WP_Error( 'file_error', 'Invalid File' );
		}

		// TODO: since 1.5.0 to content container named `content` instead of `data`.
		if ( ! empty( $data['data'] ) ) {
			$content = $data['data'];
		} else {
			$content = $data['content'];
		}

		if ( ! is_array( $content ) ) {
			return new \WP_Error( 'file_error', 'Invalid File' );
		}

		$content = $this->process_export_import_content( $content, 'on_import' );

		$page_settings = [];

		if ( ! empty( $data['page_settings'] ) ) {
			$page = new Model( [
				'id' => 0,
				'settings' => $data['page_settings'],
			] );

			$page_settings_data = $this->process_element_export_import_content( $page, 'on_import' );

			if ( ! empty( $page_settings_data['settings'] ) ) {
				$page_settings = $page_settings_data['settings'];
			}
		}

		$template_id = $this->save_item( [
			'content' => $content,
			'title' => $data['title'],
			'type' => $data['type'],
			'page_settings' => $page_settings,
		] );

		if ( is_wp_error( $template_id ) ) {
			return $template_id;
		}

		return $this->get_item( $template_id );
	}

	/**
	 * @since 1.6.0
	 * @access private
	*/
	private function prepare_template_export( $template_id ) {
		$template_data = $this->get_data( [
			'template_id' => $template_id,
		] );

		if ( empty( $template_data['content'] ) ) {
			return new \WP_Error( '404', 'The template does not exist' );
		}

		$template_data['content'] = $this->process_export_import_content( $template_data['content'], 'on_export' );

		$template_type = self::get_template_type( $template_id );

		if ( 'page' === $template_type ) {
			$page = SettingsManager::get_settings_managers( 'page' )->get_model( $template_id );

			$page_settings_data = $this->process_element_export_import_content( $page, 'on_export' );

			if ( ! empty( $page_settings_data['settings'] ) ) {
				$template_data['page_settings'] = $page_settings_data['settings'];
			}
		}

		$export_data = [
			'version' => DB::DB_VERSION,
			'title' => get_the_title( $template_id ),
			'type' => self::get_template_type( $template_id ),
		];

		$export_data += $template_data;

		return [
			'name' => 'elementor-' . $template_id . '-' . date( 'Y-m-d' ) . '.json',
			'content' => wp_json_encode( $export_data ),
		];
	}

	/**
	 * @since 1.6.0
	 * @access private
	*/
	private function send_file_headers( $file_name, $file_size ) {
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename=' . $file_name );
		header( 'Expires: 0' );
		header( 'Cache-Control: must-revalidate' );
		header( 'Pragma: public' );
		header( 'Content-Length: ' . $file_size );
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function _add_actions() {
		if ( is_admin() ) {
			add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 50 );
			add_filter( 'post_row_actions', [ $this, 'post_row_actions' ], 10, 2 );
			add_action( 'admin_footer', [ $this, 'admin_import_template_form' ] );
			add_action( 'save_post', [ $this, 'on_save_post' ], 10, 2 );
			add_action( 'parse_query', [ $this, 'admin_query_filter_types' ] );
			add_filter( 'display_post_states', [ $this, 'remove_elementor_post_state_from_library' ], 11, 2 );

			// template library bulk actions.
			add_filter( 'bulk_actions-edit-elementor_library', [ $this, 'admin_add_bulk_export_action' ] );
			add_filter( 'handle_bulk_actions-edit-elementor_library', [ $this, 'admin_export_multiple_templates' ], 10, 3 );

		}

		add_action( 'template_redirect', [ $this, 'block_template_frontend' ] );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		parent::__construct();

		$this->_add_actions();
	}
}
