<?php

namespace Elementor\Modules\ConversionCenter;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Documents_Manager;
use Elementor\Core\Experiments\Manager;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Conversion_Center_Menu_Item;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Links_Empty_View_Menu_Item;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Links_Menu_Item;
use Elementor\Modules\ConversionCenter\Documents\Link_In_Bio;
use Elementor\Modules\LandingPages\Documents\Landing_Page;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'conversion-center';

	const DOCUMENT_TYPE = 'links-page';
	const CPT_LIB = 'e-link-pages';
	const ADMIN_PAGE_SLUG_LIB = 'edit.php?post_type=' . self::CPT_LIB;

	private $has_lib = null;
	private $trashed_lib;
	private $new_lib_url;
	private $permalink_structure;

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	public function get_name(): string {
		return static::EXPERIMENT_NAME;
	}

	public function get_widgets(): array {
		return [
			'Link_In_Bio',
			'Contact_Buttons',
		];
	}

	public static function get_experimental_data(): array {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Conversion Center', 'elementor' ),
			'description' => esc_html__( 'A powerful feature to enhance your online presence. With the ability to create compelling Link in bio pages and easily accessible contact buttons, the Conversion Center is tailored to significantly boost your conversions.', 'elementor' ),
			'hidden' => true,
			'default' => Manager::STATE_INACTIVE,
		];
	}

	private function register_admin_menu_legacy( Admin_Menu_Manager $admin_menu ) {
		$menu_args = $this->get_menu_args();

		$slug = $menu_args['menu_slug'];
		$function = $menu_args['function'];
		$parent_slug = $slug . '#';
		$admin_menu->register( $parent_slug, new Conversion_Center_Menu_Item() );
		if ( is_callable( $function ) ) {
			$admin_menu->register( $slug, new Links_Empty_View_Menu_Item( $function, $parent_slug ) );
		} else {
			$admin_menu->register( $slug, new Links_Menu_Item( $parent_slug ) );
		}

	}

	public function __construct() {
		$this->permalink_structure = get_option( 'permalink_structure' );

		$this->register_lib_cpt();

		add_action( 'elementor/documents/register', function ( Documents_Manager $documents_manager ) {
			$documents_manager->register_document_type( self::DOCUMENT_TYPE, Link_In_Bio::get_class_full_name() );
		} );

		add_action( 'elementor/admin-top-bar/is-active', function ( $is_top_bar_active, $current_screen ) {
			if ( strpos( $current_screen->id ?? '', 'conversion-center' ) !== false ) {
				return true;
			}
			return $is_top_bar_active;
		}, 10, 2 );

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$this->register_admin_menu_legacy( $admin_menu );
		}, Source_Local::ADMIN_MENU_PRIORITY + 20 );

		// Add the custom 'Add New' link for Landing Pages into Elementor's admin config.
		add_action( 'elementor/admin/localize_settings', function ( array $settings ) {
			return $this->admin_localize_settings( $settings );
		} );

		add_action( 'admin_menu', function () {
			global $submenu;
			$menu_args = $this->get_menu_args();

			$slug = $menu_args['menu_slug'] . '#';
			unset( $submenu[ $slug ][0] );

		}, 100 );

		add_filter( 'elementor/template_library/sources/local/register_taxonomy_cpts', function ( array $cpts ) {
			$cpts[] = self::CPT_LIB;

			return $cpts;
		} );

		// In the Landing Pages Admin Table page - Overwrite Template type column header title.
		add_action( 'manage_' . static::CPT_LIB . '_posts_columns', function ( $posts_columns ) {
			/** @var Source_Local $source_local */
			$source_local = Plugin::$instance->templates_manager->get_source( 'local' );

			return $source_local->admin_columns_headers( $posts_columns );
		} );

		// In the Landing Pages Admin Table page - Overwrite Template type column row values.
		add_action( 'manage_' . static::CPT_LIB . '_posts_custom_column', function ( $column_name, $post_id ) {
			/** @var Landing_Page $document */
			$document = Plugin::$instance->documents->get( $post_id );

			$document->admin_columns_content( $column_name );
		}, 10, 2 );

		// Overwrite the Admin Bar's 'New +' Landing Page URL with the link that creates the new LP in Elementor
		// with the Template Library modal open.
		add_action( 'admin_bar_menu', function ( $admin_bar ) {
			// Get the Landing Page menu node.
			$new_landing_page_node = $admin_bar->get_node( 'new-e-landing-page' );

			if ( $new_landing_page_node ) {
				$new_landing_page_node->href = $this->get_add_new_lib_url();

				$admin_bar->add_node( $new_landing_page_node );
			}
		}, 100 );
	}

	private function get_trashed_lib_posts(): array {
		if ( $this->trashed_lib ) {
			return $this->trashed_lib;
		}

		// `'posts_per_page' => 1` is because this is only used as an indicator to whether there are any trashed landing pages.
		$trashed_posts_query = new \WP_Query( [
			'no_found_rows' => true,
			'post_type' => self::CPT_LIB,
			'post_status' => 'trash',
			'posts_per_page' => 1,
			'meta_key' => '_elementor_template_type',
			'meta_value' => self::DOCUMENT_TYPE,
		] );

		$this->trashed_lib = $trashed_posts_query->posts;

		return $this->trashed_lib;
	}

	private function get_add_new_lib_url() {
		if ( ! $this->new_lib_url ) {
			$this->new_lib_url = Plugin::$instance->documents->get_create_new_post_url(
				self::CPT_LIB,
				self::DOCUMENT_TYPE
			) . '#library';
		}

		return $this->new_lib_url;
	}

	public function print_empty_landing_pages_page() {
		$template_sources = Plugin::$instance->templates_manager->get_registered_sources();
		$source_local = $template_sources['local'];
		$trashed_posts = $this->get_trashed_lib_posts();

		?>
		<div class="e-landing-pages-empty">
			<?php
			/** @var Source_Local $source_local */
			$source_local->print_blank_state_template(
				esc_html__( 'Links Page', 'elementor' ),
				$this->get_add_new_lib_url(),
				esc_html__( 'Build Effective Landing Pages for your business\' marketing campaigns.', 'elementor' )
			);

			if ( ! empty( $trashed_posts ) ) : ?>
				<div class="e-trashed-items">
					<?php
					printf(
					/* translators: %1$s Link open tag, %2$s: Link close tag. */
						esc_html__( 'Or view %1$sTrashed Items%1$s', 'elementor' ),
						'<a href="' . esc_url( admin_url( 'edit.php?post_status=trash&post_type=' . self::CPT_LIB ) ) . '">',
						'</a>'
					);
					?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	private function is_lib_admin_edit() {
		$screen = get_current_screen();

		if ( 'post' === $screen->base ) {
			return $this->is_elementor_links_page( get_post() );
		}

		return false;
	}

	private function admin_localize_settings( $settings ) {
		$additional_settings = [
			'urls' => [
				'addNewLinkUrl' => $this->get_add_new_lib_url(),
			],
			'linksPages' => [
				'hasPages' => $this->has_landing_pages(),
				'isAdminEdit' => $this->is_lib_admin_edit(),
			],
		];

		return array_replace_recursive( $settings, $additional_settings );
	}

	private function register_lib_cpt() {
		$labels = [
			'name' => esc_html__( 'Links Pages', 'elementor' ),
			'singular_name' => esc_html__( 'Links Page', 'elementor' ),
			'add_new' => esc_html__( 'Add New', 'elementor' ),
			'add_new_item' => esc_html__( 'Add New Links Page', 'elementor' ),
			'edit_item' => esc_html__( 'Edit Links Page', 'elementor' ),
			'new_item' => esc_html__( 'New Links Page', 'elementor' ),
			'all_items' => esc_html__( 'All Links Pages', 'elementor' ),
			'view_item' => esc_html__( 'View Links Page', 'elementor' ),
			'search_items' => esc_html__( 'Search Links Pages', 'elementor' ),
			'not_found' => esc_html__( 'No Links Pages found', 'elementor' ),
			'not_found_in_trash' => esc_html__( 'No Links Pages found in trash', 'elementor' ),
			'parent_item_colon' => '',
			'menu_name' => esc_html__( 'Links Pages', 'elementor' ),
		];

		$args = [
			'labels' => $labels,
			'public' => true,
			'show_in_menu' => 'edit.php?post_type=elementor_library&tabs_group=library',
			'capability_type' => 'page',
			'taxonomies' => [ Source_Local::TAXONOMY_TYPE_SLUG ],
			'supports' => [
				'title',
				'editor',
				'comments',
				'revisions',
				'trackbacks',
				'author',
				'excerpt',
				'page-attributes',
				'thumbnail',
				'custom-fields',
				'post-formats',
				'elementor',
			],
		];

		register_post_type( self::CPT_LIB, $args );
	}

	private function has_landing_pages(): bool {
		if ( null !== $this->has_lib ) {
			return $this->has_lib;
		}

		$posts_query = new \WP_Query( [
			'no_found_rows' => true,
			'post_type' => self::CPT_LIB,
			'post_status' => 'any',
			'posts_per_page' => 1,
			'meta_key' => '_elementor_template_type',
			'meta_value' => self::DOCUMENT_TYPE,
		] );

		$this->has_lib = $posts_query->post_count > 0;

		return $this->has_lib;
	}

	public function is_elementor_links_page( \WP_Post $post ): bool {
		return self::CPT_LIB === $post->post_type;
	}

	private function get_menu_args(): array {
		if ( $this->has_landing_pages() ) {
			$menu_slug = self::ADMIN_PAGE_SLUG_LIB;
			$function = null;
		} else {
			$menu_slug = self::CPT_LIB;
			$function = [ $this, 'print_empty_landing_pages_page' ];
		}

		return [
			'menu_slug' => $menu_slug,
			'function' => $function,
		];
	}

}
