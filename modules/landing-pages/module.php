<?php
namespace Elementor\Modules\LandingPages;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Documents_Manager;
use Elementor\Modules\LandingPages\Documents\Landing_Page;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const DOCUMENT_TYPE = 'landing-page';
	const CPT = 'e-landing-page';
	const ADMIN_PAGE_SLUG = 'edit.php?post_type=' . self::CPT;

	private $posts;
	private $trashed_posts;
	private $new_lp_url;
	private $permalink_structure;

	public function get_name() {
		return 'landing-pages';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'landing-pages',
			'title' => __( 'Landing Pages', 'elementor' ),
			'description' => __( 'Adds a new Elementor content type that allows creating beautiful landing pages instantly in a streamlined workflow.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
		];
	}

	private function get_trashed_landing_page_posts() {
		if ( $this->trashed_posts ) {
			return $this->trashed_posts;
		}

		// `'posts_per_page' => 1` is because this is only used as an indicator to whether there are any trashed landing pages.
		$this->trashed_posts = new \WP_Query( [
			'post_type' => self::CPT,
			'post_status' => 'trash',
			'posts_per_page' => 1,
		] );

		return $this->trashed_posts;
	}

	private function get_landing_page_posts() {
		if ( $this->posts ) {
			return $this->posts;
		}

		// `'posts_per_page' => 1` is because this is only used as an indicator to whether there are any landing pages.
		$this->posts = new \WP_Query( [
			'post_type' => self::CPT,
			// 'post_status' is not 'any' because 'any' does not include auto-drafts and revisions.
			'post_status' => [ 'publish', 'pending', 'draft', 'auto-draft', 'future', 'private', 'inherit' ],
			'posts_per_page' => 1,
		] );

		return $this->posts;
	}

	/**
	 * Is Elementor Landing Page.
	 *
	 * Check whether the post is an Elementor Landing Page.
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param \WP_Post $post Post Object
	 *
	 * @return bool Whether the post was built with Elementor.
	 */
	public function is_elementor_landing_page( $post ) {
		return self::CPT === $post->post_type;
	}

	/**
	 * Add Submenu Page
	 *
	 * Adds the 'Landing Pages' submenu item to the 'Templates' menu item.
	 *
	 * @since 3.1.0
	 */
	private function add_submenu_page() {
		$posts = $this->get_landing_page_posts();

		// If there are no Landing Pages, show the "Create Your First Landing Page" page.
		// If there are, show the pages table.
		if ( ! empty( $posts->posts ) ) {
			$landing_page_menu_slug = self::ADMIN_PAGE_SLUG;
			$landing_page_menu_callback = null;
		} else {
			$landing_page_menu_slug = self::CPT;
			$landing_page_menu_callback = [ $this, 'print_empty_landing_pages_page' ];
		}

		$landing_pages_title = __( 'Landing Pages', 'elementor' );

		add_submenu_page(
			Source_Local::ADMIN_MENU_SLUG,
			$landing_pages_title,
			$landing_pages_title,
			'manage_options',
			$landing_page_menu_slug,
			$landing_page_menu_callback
		);
	}

	private function get_add_new_landing_page_url() {
		if ( ! $this->new_lp_url ) {
			$this->new_lp_url = Utils::get_create_new_post_url( self::CPT, self::DOCUMENT_TYPE ) . '#library';
		}
		return $this->new_lp_url;
	}

	/**
	 * Get Empty Landing Pages Page
	 *
	 * Prints the HTML content of the page that is displayed when there are no existing landing pages in the DB.
	 * Added as the callback to add_submenu_page.
	 *
	 * @since 3.1.0
	 */
	public function print_empty_landing_pages_page() {
		$template_sources = Plugin::$instance->templates_manager->get_registered_sources();
		$source_local = $template_sources['local'];
		$trashed_posts = $this->get_trashed_landing_page_posts();

		?>
		<div class="e-landing-pages-empty">
		<?php
		/** @var Source_Local $source_local */
		$source_local->print_blank_state_template( __( 'Landing Page', 'elementor' ), $this->get_add_new_landing_page_url(), __( 'Build Effective Landing Pages for your business\' marketing campaigns.', 'elementor' ) );

		if ( ! empty( $trashed_posts->posts ) ) { ?>
			<div class="e-trashed-items">
				<?php echo sprintf( __( 'Or view <a href="%s">Trashed Items</a>', 'elementor' ), admin_url( 'edit.php?post_status=trash&post_type=' . self::CPT ) ); ?>
			</div>
		<?php } ?>
		</div>
		<?php
	}

	/**
	 * Add Finder Items
	 *
	 * Adds Items to the Finder index to make them searchable in the Elementor Editor Finder modal.
	 *
	 * @since 3.1.0
	 *
	 * @param array $categories
	 * @return array $categories
	 */
	private function add_finder_items( array $categories ) {
		$categories['general']['items']['landing-pages'] = [
			'title' => __( 'Landing Pages', 'elementor' ),
			'icon' => 'single-page',
			'url' => admin_url( self::ADMIN_PAGE_SLUG ),
			'keywords' => [ self::DOCUMENT_TYPE, 'landing', 'page', 'library' ],
		];

		$categories['create']['items']['landing-pages'] = [
			'title' => __( 'Add New Landing Page', 'elementor' ),
			'icon' => 'single-page',
			'url' => $this->get_add_new_landing_page_url(),
			'keywords' => [ self::DOCUMENT_TYPE, 'landing', 'page', 'new', 'create', 'library' ],
		];

		return $categories;
	}

	/**
	 * Is Current Admin Page Edit LP
	 *
	 * Checks whether the current page is a native WordPress edit page for a landing page.
	 */
	private function is_landing_page_admin_edit() {
		$screen = get_current_screen();

		if ( 'post' === $screen->base ) {
			return $this->is_elementor_landing_page( get_post() );
		}

		return false;
	}

	private function admin_localize_settings( $settings ) {
		$additional_settings = [
			'urls' => [
				'addNewLandingPageUrl' => $this->get_add_new_landing_page_url(),
			],
			'landingPages' => [
				'landingPagesHasPages' => [] !== $this->get_landing_page_posts(),
				'isLandingPageAdminEdit' => $this->is_landing_page_admin_edit(),
			],
		];

		return array_replace_recursive( $settings, $additional_settings );
	}

	private function register_landing_page_cpt() {
		$labels = [
			'name' => __( 'Landing Pages', 'elementor' ),
			'singular_name' => __( 'Landing Page', 'elementor' ),
			'add_new' => __( 'Add New', 'elementor' ),
			'add_new_item' => __( 'Add New Landing Page', 'elementor' ),
			'edit_item' => __( 'Edit Landing Page', 'elementor' ),
			'new_item' => __( 'New Landing Page', 'elementor' ),
			'all_items' => __( 'All Landing Pages', 'elementor' ),
			'view_item' => __( 'View Landing Page', 'elementor' ),
			'search_items' => __( 'Search Landing Pages', 'elementor' ),
			'not_found' => __( 'No landing pages found', 'elementor' ),
			'not_found_in_trash' => __( 'No landing pages found in trash', 'elementor' ),
			'parent_item_colon' => '',
			'menu_name' => __( 'Landing Pages', 'elementor' ),
		];

		$args = [
			'labels' => $labels,
			'public' => true,
			'show_in_menu' => 'edit.php?post_type=elementor_library&tabs_group=library',
			'capability_type' => 'page',
			'taxonomies' => [ Source_Local::TAXONOMY_TYPE_SLUG ],
			'supports' => [ 'title', 'editor', 'comments', 'revisions', 'trackbacks', 'author', 'excerpt', 'page-attributes', 'thumbnail', 'custom-fields', 'post-formats', 'elementor' ],
		];

		if ( false !== strpos( $this->permalink_structure, '/%postname%/' ) ) {
			// For rewriting the Landing Page's permalink to act like a page in case the site's permalink structure
			// is '/%postname%/'.
			$args['rewrite'] = [
				'slug' => '/',
				'with_front' => false,
			];
		}

		register_post_type( self::CPT, $args );
	}

	public function remove_post_type_slug( $post_link, $post, $leavename ) {
		if ( self::CPT !== $post->post_type || 'publish' !== $post->post_status ) {
			return $post_link;
		}

		return str_replace( '/' . $post->post_type . '/', '/', $post_link );
	}

	public function adjust_landing_page_query( $query ) {
		if ( ! $query->is_main_query() || 2 !== count( $query->query ) || ! isset( $query->query['page'] ) ) {
			return;
		}
		if ( ! empty( $query->query['name'] ) ) {
			$query->set( 'post_type', [ 'post', self::CPT, 'page' ] );
		}
	}

	public function __construct() {
		$this->permalink_structure = get_option( 'permalink_structure' );

		$this->register_landing_page_cpt();

		// Landing Pages should act like pages, including in their permalink structure. If the permalink structure is
		// `/%postname%/`, the following hooks change the permalink to remove the CPT slug from it.
		if ( ! is_admin() && false !== strpos( $this->permalink_structure, '/%postname%/' ) ) {
			add_filter( 'post_type_link', function( $post_link, $post, $leavename ) {
				$this->remove_post_type_slug( $post_link, $post, $leavename );
			}, 10, 3 );

			add_action( 'pre_get_posts', function( $query ) {
				$this->adjust_landing_page_query( $query );
			} );
		}

		add_action( 'elementor/documents/register', function( Documents_Manager $documents_manager ) {
			$documents_manager->register_document_type( self::DOCUMENT_TYPE, Landing_Page::get_class_full_name() );
		} );

		add_action( 'admin_menu', function() {
			$this->add_submenu_page();
		}, 30 );

		// Add the custom 'Add New' link for Landing Pages into Elementor's admin config.
		add_action( 'elementor/admin/localize_settings', function( array $settings ) {
			return $this->admin_localize_settings( $settings );
		} );

		add_filter( 'elementor/finder/categories', function( array $categories ) {
			return $this->add_finder_items( $categories );
		} );

		add_filter( 'elementor/template_library/sources/local/register_taxonomy_cpts', function( array $cpts ) {
			$cpts[] = self::CPT;

			return $cpts;
		} );
	}
}
