<?php
namespace Elementor\Modules\LandingPages;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Documents_Manager;
use Elementor\Modules\LandingPages\Documents\Landing_Page;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const DOCUMENT_TYPE = 'landing-page';
	const ADMIN_PAGE_SLUG = 'edit.php?post_type=page&elementor_library_type=landing-page';

	private $posts;
	private $trashed_posts;

	public function get_name() {
		return 'landing-pages';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'landing-pages',
			'title' => __( 'Landing Pages', 'elementor' ),
			'description' => __( 'Adds a new Elementor content type that allows creating beautiful landing pages instantly in a streamlined workflow.', 'elementor' ),
		];
	}

	private function get_trashed_landing_page_posts() {
		if ( $this->trashed_posts ) {
			return $this->trashed_posts;
		}

		$this->trashed_posts = new \WP_Query( [
			'post_type' => 'page',
			'post_status' => 'trash',
			'elementor_library_type' => self::DOCUMENT_TYPE,
			'meta_key' => '_elementor_template_type',
			'meta_value' => self::DOCUMENT_TYPE,
		] );

		return $this->trashed_posts;
	}

	private function get_landing_page_posts() {
		if ( $this->posts ) {
			return $this->posts;
		}

		$this->posts = new \WP_Query( [
			'post_type' => 'page',
			'elementor_library_type' => self::DOCUMENT_TYPE,
			'meta_key' => '_elementor_template_type',
			'meta_value' => self::DOCUMENT_TYPE,
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
		// If the post is not a page, save a call to the DB.
		if ( 'page' !== $post->post_type ) {
			return false;
		}

		return 'landing-page' === get_post_meta( $post->ID, '_elementor_template_type', true );
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
			$this->landing_page_menu_slug = self::ADMIN_PAGE_SLUG;
			$landing_page_menu_callback = null;
		} else {
			$this->landing_page_menu_slug = self::DOCUMENT_TYPE;
			$landing_page_menu_callback = [ $this, 'print_empty_landing_pages_page' ];
		}

		$landing_pages_title = __( 'Landing Pages', 'elementor' );

		add_submenu_page(
			Source_Local::ADMIN_MENU_SLUG,
			$landing_pages_title,
			$landing_pages_title,
			'manage_options',
			$this->landing_page_menu_slug,
			$landing_page_menu_callback
		);
	}

	private function get_add_new_landing_page_url() {
		return Utils::get_create_new_post_url( 'page', self::DOCUMENT_TYPE ) . '#library';
	}

	/**
	 * Remove Type Column
	 *
	 * Removes the "Type" column from the pages table.
	 *
	 * @since 3.1.0
	 *
	 * @param array $columns
	 * @return array $columns
	 */
	private function remove_type_column( $columns ) {
		unset( $columns['taxonomy-elementor_library_type'] );

		return $columns;
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
				<?php echo sprintf( __( 'Or view <a href="%s">Trashed Items</a>', 'elementor' ), admin_url( 'edit.php?post_status=trash&post_type=page&elementor_library_type=landing-page' ) ); ?>
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
			'url' => esc_url( Utils::get_create_new_post_url( 'page', self::DOCUMENT_TYPE ) ) . '#library',
			'keywords' => [ 'landing-page', 'landing', 'page', 'new', 'create', 'library' ],
		];

		return $categories;
	}

	/**
	 * Change Admin Page Title
	 *
	 * Changes the page title of the "Landing Pages" Admin page which displays the "Pages" table,
	 * from "Pages" to the "Landing Pages" translation string.
	 *
	 * @since 3.1.0
	 */
	private function change_admin_page_title() {
		global $wp_post_types;

		if ( $this->is_landing_pages_page() ) {
			$wp_post_types['page']->labels->name = __( 'Landing Pages', 'elementor' );
		}
	}

	/**
	 * Change Admin Meta Title
	 *
	 * Changes the contents of the meta <title> tag in the "Landing Pages" Admin page which displays the "Pages" table,
	 * from "Pages" to "Landing Pages".
	 *
	 * @since 3.1.0
	 *
	 * @param string $title meta title contents
	 * @return string $title
	 */
	private function change_admin_meta_title( $title ) {
		if ( $this->is_landing_pages_page() ) {
			// Get WordPress' default 'Pages' translation string, since the original title comes from WordPress core.
			return str_replace( __( 'Pages', 'elementor' ), __( 'Landing Pages', 'elementor' ), $title ); // phpcs:ignore WordPress.WP.I18n.TextDomainMismatch
		}

		return $title;
	}

	private function is_landing_pages_page() {
		global $wp_the_query;

		return isset( $wp_the_query->query['post_type'] )
			&& isset( $wp_the_query->query['elementor_library_type'] )
			&& 'page' === $wp_the_query->query['post_type']
			&& self::DOCUMENT_TYPE === $wp_the_query->query['elementor_library_type'];
	}

	/**
	 * Add Landing Page post state.
	 *
	 * Adds a new "Landing Page" post state to the post table.
	 *
	 * Fired by `display_post_states` filter.
	 *
	 * @since 1.8.0
	 * @access public
	 *
	 * @param array    $post_states An array of post display states.
	 * @param \WP_Post $post        The current post object.
	 *
	 * @return array A filtered array of post display states.
	 */
	public function add_landing_page_post_state( $post_states, $post ) {
		if ( User::is_current_user_can_edit( $post->ID ) && $this->is_elementor_landing_page( $post ) ) {
			$post_states['landing-page'] = __( 'Landing Page', 'elementor' );
		}

		return $post_states;
	}

	/**
	 * Is Current Admin Page Edit LP
	 *
	 * Checks whether the current page is a native WordPress edit page for a landing page.
	 */
	private function is_current_admin_page_edit_lp() {
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
				'isCurrentPageLPAdminEdit' => $this->is_current_admin_page_edit_lp(),
			],
		];

		return array_replace_recursive( $settings, $additional_settings );
	}

	public function __construct() {
		add_action( 'elementor/documents/register', function( Documents_Manager $documents_manager ) {
			$documents_manager->register_document_type( self::DOCUMENT_TYPE, Landing_Page::get_class_full_name() );
		} );

		add_action( 'admin_menu', function() {
			$this->add_submenu_page();
		}, 30 );

		// This is a hack to change the H1 title of the Landing Pages table page from 'Pages' to 'Landing Pages'.
		add_action( 'admin_head', function() {
			$this->change_admin_page_title();
		} );

		// When visiting the Landing Pages Table page, the default title is 'Pages'. This filter callback changes it
		// to the 'Landing Pages' translation string.
		add_filter( 'admin_title', function( $title ) {
			return $this->change_admin_meta_title( $title );
		} );

		add_action( 'parent_file', function( $parent_file ) {
			global $current_screen;

			if ( 'post' === $current_screen->base && $this->is_elementor_landing_page( get_post() ) ) {
				return Source_Local::ADMIN_MENU_SLUG;
			}

			return $parent_file;
		} );

		// Add the custom 'Add New' link for Landing Pages into Elementor's admin config.
		add_action( 'elementor/admin/localize_settings', function( $settings ) {
			return $this->admin_localize_settings( $settings );
		} );

		add_filter( 'elementor/finder/categories', function( $categories ) {
			return $this->add_finder_items( $categories );
		} );

		// Remove the "Type" column added to the Pages table by the Landing Page document.
		add_filter( 'manage_page_posts_columns', function( $columns ) {
			return $this->remove_type_column( $columns );
		} );

		add_filter( 'display_post_states', [ $this, 'add_landing_page_post_state' ], 20, 2 );
	}
}
