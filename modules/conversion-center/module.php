<?php

namespace Elementor\Modules\ConversionCenter;

use DOMDocument;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Documents_Manager;
use Elementor\Core\Experiments\Manager;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Contact_Empty_View_Menu_Item;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Contact_Menu_Item;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Conversion_Center_Menu_Item;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Links_Empty_View_Menu_Item;
use Elementor\Modules\ConversionCenter\AdminMenuItems\Links_Menu_Item;
use Elementor\Modules\ConversionCenter\Documents\Contact_Buttons;
use Elementor\Modules\ConversionCenter\Documents\Links_Page;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Modules\LandingPages\Documents\Landing_Page;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'conversion-center';

	const CONTACT_PAGE_DOCUMENT_TYPE = 'contact-buttons';
	const CPT_CONTACT_PAGES = 'e-contact-pages';
	const ADMIN_PAGE_SLUG_CONTACT = 'edit.php?post_type=' . self::CPT_CONTACT_PAGES;

	private $has_contact_pages = null;
	private $trashed_contact_pages;
	private $new_contact_pages_url;

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
		$menu_args = $this->get_contact_menu_args();
		$function = $menu_args['function'];
		if ( is_callable( $function ) ) {
			$admin_menu->register( $menu_args['menu_slug'], new Contact_Empty_View_Menu_Item( $function ) );
		} else {
			$admin_menu->register( $menu_args['menu_slug'], new Contact_Menu_Item() );
		};

	}

	public function __construct() {
		parent::__construct();

		$this->register_contact_pages_cpt();

		add_action( 'elementor/documents/register', function ( Documents_Manager $documents_manager ) {
			$documents_manager->register_document_type( self::CONTACT_PAGE_DOCUMENT_TYPE, Contact_Buttons::get_class_full_name() );
		} );

		add_action( 'wp_ajax_elementor_send_clicks', [ $this, 'handle_click_tracking' ] );
		add_action( 'wp_ajax_nopriv_elementor_send_clicks', [ $this, 'handle_click_tracking' ] );

		add_action( 'elementor/admin-top-bar/is-active', function ( $is_top_bar_active, $current_screen ) {

			if ( strpos( $current_screen->id ?? '', self::CPT_CONTACT_PAGES ) !== false ) {
				return true;
			}

			return $is_top_bar_active;
		}, 10, 2 );

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$this->register_admin_menu_legacy( $admin_menu );
		}, Source_Local::ADMIN_MENU_PRIORITY + 20 );

		add_action( 'elementor/admin/localize_settings', function ( array $settings ) {
			return $this->admin_localize_settings( $settings );
		} );

		add_action( 'elementor/editor/localize_settings', function ( $data ) {
			return $this->editor_localize_settings( $data );
		} );

		add_filter( 'elementor/template_library/sources/local/register_taxonomy_cpts', function ( array $cpts ) {
			$cpts[] = self::CPT_CONTACT_PAGES;

			return $cpts;
		} );

		add_action( 'admin_init', function () {
			$action = filter_input( INPUT_GET, 'action' );
			$menu_args = $this->get_contact_menu_args();

			switch ( $action ) {
				case 'remove_from_entire_site':
					$post = filter_input( INPUT_GET, 'post', FILTER_VALIDATE_INT );
					check_admin_referer( 'remove_from_entire_site_' . $post );
					delete_post_meta( $post, '_elementor_conditions' );
					wp_redirect( $menu_args['menu_slug'] );
					exit;
				case 'set_as_entire_site':
					$post = filter_input( INPUT_GET, 'post', FILTER_VALIDATE_INT );
					check_admin_referer( 'set_as_entire_site_' . $post );
					update_post_meta( $post, '_elementor_conditions', [ 'include/general' ] );

					$posts = get_posts( [
						'post_type' => ConversionCenterModule::CPT_CONTACT_PAGES,
						'posts_per_page' => -1,
						'post_status' => 'publish',
						'fields' => 'ids',
						'exclude' => $post,
					] );

					foreach ( $posts as $post_id ) {
						delete_post_meta( $post_id, '_elementor_conditions' );
					}

					wp_redirect( $menu_args['menu_slug'] );
					exit;
				default:
					break;
			}
		} );

		add_action( 'manage_' . self::CPT_CONTACT_PAGES . '_posts_columns', function( $posts_columns ) {
			$source_local = Plugin::$instance->templates_manager->get_source( 'local' );
			unset( $posts_columns['date'] );
			unset( $posts_columns['comments'] );
			$posts_columns['click_tracking'] = esc_html__( 'Click Tracking', 'elementor' );
			$posts_columns['instances'] = esc_html__( 'Instances', 'elementor' );

			return $source_local->admin_columns_headers( $posts_columns );
		} );

		add_action(
			'manage_' . self::CPT_CONTACT_PAGES . '_posts_custom_column',
			[ $this, 'set_admin_columns_content' ],
			10,
			2
		);

		add_action( 'admin_bar_menu', function ( $admin_bar ) {

			$this->override_admin_bar_add_contact( $admin_bar );
		}, 100 );
	}

	public function handle_click_tracking() {
		$data = filter_input_array( INPUT_POST, [
			'clicks' => [
				'filter' => FILTER_VALIDATE_INT,
				'flags' => FILTER_REQUIRE_ARRAY,
			],
			'_nonce' => FILTER_UNSAFE_RAW,
		] );

		if ( ! wp_verify_nonce( $data['_nonce'], 'elementor-pro-frontend' ) ) {
			wp_send_json_error( [ 'message' => 'Invalid nonce' ] );
		}

		$posts_to_update = [];

		foreach ( $data['clicks'] as $post_id ) {
			if ( ! isset( $posts_to_update[ $post_id ] ) ) {
				$starting_clicks = (int) get_post_meta( $post_id, '_elementor_click_tracking', true );
				$posts_to_update[ $post_id ] = $starting_clicks ? $starting_clicks : 0;
			}
			$posts_to_update[ $post_id ] ++;
		}

		foreach ( $posts_to_update as $post_id => $clicks ) {
			update_post_meta( $post_id, '_elementor_click_tracking', $clicks );
		}

		wp_send_json_success( [ 'nonce' => wp_create_nonce( 'elementor-pro-frontend' ) ] );
	}

	public function set_admin_columns_content( $column_name, $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );

		$document->admin_columns_content( $column_name );
		switch ( $column_name ) {
			case 'click_tracking':
				$click_tracking = get_post_meta( $post_id, '_elementor_click_tracking', true );
				echo esc_html( $click_tracking );
				break;
			case 'instances':
				$instances = get_post_meta( $post_id, '_elementor_conditions', true );
				if ( $instances ) {
					echo esc_html( 'Entire Site' );
				}
				break;
			default:
				break;
		}
	}


	private function get_trashed_contact_posts(): array {
		if ( $this->trashed_contact_pages ) {
			return $this->trashed_contact_pages;
		}

		$this->trashed_contact_pages = $this->get_trashed_posts(
			self::CPT_CONTACT_PAGES,
			self::CONTACT_PAGE_DOCUMENT_TYPE
		);

		return $this->trashed_contact_pages;
	}

	private function get_trashed_posts( string $cpt, string $document_type ) {
		$query = new \WP_Query( [
			'no_found_rows' => true,
			'post_type' => $cpt,
			'post_status' => 'trash',
			'posts_per_page' => 1,
			'meta_key' => '_elementor_template_type',
			'meta_value' => $document_type,
		] );

		return $query->posts;
	}

	private function get_add_new_contact_page_url() {
		if ( ! $this->new_contact_pages_url ) {
			$this->new_contact_pages_url = Plugin::$instance->documents->get_create_new_post_url(
				self::CPT_CONTACT_PAGES,
				self::CONTACT_PAGE_DOCUMENT_TYPE
			) . '#library';
		}

		return $this->new_contact_pages_url;
	}

	public function print_empty_contact_pages_page() {
		$template_sources = Plugin::$instance->templates_manager->get_registered_sources();
		$source_local = $template_sources['local'];
		$trashed_posts = $this->get_trashed_contact_posts();

		?>
		<div class="e-landing-pages-empty">
			<?php
			/** @var Source_Local $source_local */
			$source_local->print_blank_state_template(
				esc_html__( 'Floating Buttons', 'elementor' ),
				$this->get_add_new_contact_page_url(),
				esc_html__( 'Add a Contact button so your users can easily get in touch!', 'elementor' )
			);

			if ( ! empty( $trashed_posts ) ) : ?>
				<div class="e-trashed-items">
					<?php
					printf(
					/* translators: %1$s Link open tag, %2$s: Link close tag. */
						esc_html__( 'Or view %1$sTrashed Items%1$s', 'elementor' ),
						'<a href="' . esc_url( admin_url( 'edit.php?post_status=trash&post_type=' . self::CPT_CONTACT_PAGES ) ) . '">',
						'</a>'
					);
					?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	private function admin_localize_settings( $settings ) {
		$contact_menu_slug = $this->get_contact_menu_args()['menu_slug'];

		if ( self::CPT_CONTACT_PAGES === $contact_menu_slug ) {
			$contact_menu_slug = 'admin.php?page=' . $contact_menu_slug;
		}

		$additional_settings = [
			'urls' => [
				'addNewLinkUrlContact' => $this->get_add_new_contact_page_url(),
				'viewContactPageUrl' => $contact_menu_slug,
			],
			'contactPages' => [
				'hasPages' => $this->has_contact_pages(),
			],
		];

		return array_replace_recursive( $settings, $additional_settings );
	}

	private function register_contact_pages_cpt() {
		$this->register_post_type(
			Contact_Buttons::get_labels(),
			self::CPT_CONTACT_PAGES
		);
	}

	private function register_post_type( array $labels, string $cpt ) {
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

		register_post_type( $cpt, $args );
	}

	private function has_contact_pages(): bool {
		if ( null !== $this->has_contact_pages ) {
			return $this->has_contact_pages;
		}

		$this->has_contact_pages = $this->has_pages(
			self::CPT_CONTACT_PAGES,
			self::CONTACT_PAGE_DOCUMENT_TYPE
		);

		return $this->has_contact_pages;
	}

	private function has_pages( string $cpt, string $document_type ): bool {
		$posts_query = new \WP_Query( [
			'no_found_rows' => true,
			'post_type' => $cpt,
			'post_status' => 'any',
			'posts_per_page' => 1,
			'meta_key' => '_elementor_template_type',
			'meta_value' => $document_type,
		] );

		return $posts_query->post_count > 0;

	}

	private function get_contact_menu_args(): array {
		if ( $this->has_contact_pages() ) {
			$menu_slug = self::ADMIN_PAGE_SLUG_CONTACT;
			$function = null;
		} else {
			$menu_slug = self::CPT_CONTACT_PAGES;
			$function = [ $this, 'print_empty_contact_pages_page' ];
		}

		return [
			'menu_slug' => $menu_slug,
			'function' => $function,
		];
	}

	public function override_admin_bar_add_contact( $admin_bar ): void {
		$new_contact_page_node = $admin_bar->get_node( 'new-e-contact-pages' );

		if ( $new_contact_page_node ) {
			$new_contact_page_node->href = $this->get_add_new_contact_page_url();

			$admin_bar->add_node( $new_contact_page_node );
		}
	}

	private function editor_localize_settings( $data ) {
		$data['admin_conversion_center_contact_url'] = admin_url( $this->get_contact_menu_args()['menu_slug'] );
		return $data;
	}

}
