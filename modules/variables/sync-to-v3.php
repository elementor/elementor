<?php

namespace Elementor\Modules\Variables;

use Elementor\Plugin;
use Elementor\Core\Settings\Page\Manager as PageManager;
use Elementor\Modules\Variables\Storage\Variables_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sync_To_V3 {
	
	private $prefix = 'v4_';
	
	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_admin_menu' ], 100 );
		add_action( 'admin_post_elementor_sync_v4_colors', [ $this, 'handle_sync_request' ] );
		add_action( 'elementor/variables/after_save', [ $this, 'auto_sync_on_save' ] );
	}
	
	public function add_admin_menu() {
		add_submenu_page(
			'elementor',
			esc_html__( 'V4 to V3 Sync', 'elementor' ),
			esc_html__( 'V4 to V3 Sync', 'elementor' ),
			'manage_options',
			'elementor-v4-v3-sync',
			[ $this, 'render_admin_page' ]
		);
	}
	
	public function render_admin_page() {
		$colors = $this->get_v4_color_variables();
		$synced = $this->get_synced_colors_count();
		
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( 'V4 Variables to V3 Colors Sync', 'elementor' ); ?></h1>
			
			<div class="notice notice-info">
				<p>
					<strong><?php echo esc_html__( 'What does this do?', 'elementor' ); ?></strong><br>
					<?php echo esc_html__( 'This tool syncs color variables from V4 (new atomic editor) to V3 Site Settings → Global Colors in a dedicated "Variables" section, making them available in V3 elements.', 'elementor' ); ?>
				</p>
			</div>
			
			<div class="card">
				<h2><?php echo esc_html__( 'Status', 'elementor' ); ?></h2>
				<table class="widefat">
					<tbody>
						<tr>
							<td><strong><?php echo esc_html__( 'V4 Color Variables', 'elementor' ); ?></strong></td>
							<td><?php echo count( $colors ); ?></td>
						</tr>
						<tr>
							<td><strong><?php echo esc_html__( 'Synced to V3', 'elementor' ); ?></strong></td>
							<td><?php echo $synced; ?></td>
						</tr>
					</tbody>
				</table>
			</div>
			
			<?php if ( ! empty( $colors ) ): ?>
				<div class="card" style="margin-top: 20px;">
					<h2><?php echo esc_html__( 'V4 Color Variables', 'elementor' ); ?></h2>
					<table class="widefat">
						<thead>
							<tr>
								<th><?php echo esc_html__( 'Preview', 'elementor' ); ?></th>
								<th><?php echo esc_html__( 'Label', 'elementor' ); ?></th>
								<th><?php echo esc_html__( 'Value', 'elementor' ); ?></th>
								<th><?php echo esc_html__( 'V3 ID', 'elementor' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $colors as $color ): ?>
								<tr>
									<td>
										<div style="width: 40px; height: 40px; background-color: <?php echo esc_attr( $color['value'] ); ?>; border: 1px solid #ddd; border-radius: 3px;"></div>
									</td>
									<td><?php echo esc_html( $color['label'] ); ?></td>
									<td><code><?php echo esc_html( $color['value'] ); ?></code></td>
									<td><code><?php echo esc_html( $this->prefix . $color['id'] ); ?></code></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
				
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top: 20px;">
					<?php wp_nonce_field( 'elementor_sync_v4_colors' ); ?>
					<input type="hidden" name="action" value="elementor_sync_v4_colors">
					
					<p class="submit">
						<button type="submit" class="button button-primary button-large">
							<?php echo esc_html__( 'Sync to V3 Variables Section', 'elementor' ); ?>
						</button>
					</p>
					
					<p class="description">
						<?php echo esc_html__( 'This will sync these colors to Site Settings → Global Colors → Variables section. System and custom colors will not be affected.', 'elementor' ); ?>
					</p>
				</form>
			<?php else: ?>
				<div class="notice notice-warning" style="margin-top: 20px;">
					<p>
						<strong><?php echo esc_html__( 'No V4 color variables found', 'elementor' ); ?></strong><br>
						<?php echo esc_html__( 'Create color variables in the V4 editor first, then come back here to sync them.', 'elementor' ); ?>
					</p>
				</div>
			<?php endif; ?>
			
			<div class="card" style="margin-top: 20px;">
				<h2><?php echo esc_html__( 'How to Use', 'elementor' ); ?></h2>
				<ol>
					<li><?php echo esc_html__( 'Create color variables in V4 editor (requires e_variables experiment)', 'elementor' ); ?></li>
					<li><?php echo esc_html__( 'Click "Sync to V3 Variables Section" button above', 'elementor' ); ?></li>
					<li><?php echo esc_html__( 'Colors will appear in Site Settings → Global Colors → Variables section', 'elementor' ); ?></li>
					<li><?php echo esc_html__( 'Use these colors in any V3 element', 'elementor' ); ?></li>
				</ol>
				
				<h3><?php echo esc_html__( 'Automatic Syncing', 'elementor' ); ?></h3>
				<p><?php echo esc_html__( 'Colors are automatically synced when you save variables in V4. Manual sync is available here for bulk updates.', 'elementor' ); ?></p>
			</div>
		</div>
		
		<style>
			.card {
				background: #fff;
				border: 1px solid #ccd0d4;
				box-shadow: 0 1px 1px rgba(0,0,0,.04);
				padding: 20px;
			}
			.card h2 {
				margin-top: 0;
			}
		</style>
		<?php
	}
	
	public function handle_sync_request() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions.', 'elementor' ) );
		}
		
		check_admin_referer( 'elementor_sync_v4_colors' );
		
		$result = $this->sync_colors();
		
		$redirect_url = add_query_arg(
			[
				'page' => 'elementor-v4-v3-sync',
				'sync_result' => $result['success'] ? 'success' : 'error',
				'added' => $result['added'] ?? 0,
				'updated' => $result['updated'] ?? 0,
			],
			admin_url( 'admin.php' )
		);
		
		wp_safe_redirect( $redirect_url );
		exit;
	}
	
	public function auto_sync_on_save() {
		error_log( 'V4 to V3 Sync: auto_sync_on_save triggered' );
		$result = $this->sync_colors();
		error_log( 'V4 to V3 Sync result: ' . print_r( $result, true ) );
		return $result;
	}
	
	private function get_v4_color_variables() {
		try {
			$kit = Plugin::$instance->kits_manager->get_active_kit();
			$repository = new Variables_Repository( $kit );
			$collection = $repository->load();
			
			$colors = [];
			
			foreach ( $collection->all() as $variable ) {
				$var_type = $variable->type();
				if ( ( $var_type === 'global-color-variable' || $var_type === 'color' ) && ! $variable->is_deleted() ) {
					$colors[] = [
						'id' => $variable->id(),
						'label' => $variable->label(),
						'value' => $variable->value(),
					];
				}
			}
			
			return $colors;
		} catch ( \Exception $e ) {
			return [];
		}
	}
	
	private function get_synced_colors_count() {
		try {
			$kit = Plugin::$instance->kits_manager->get_active_kit();
			$kit_settings = $kit->get_meta( PageManager::META_KEY );
			
			if ( ! isset( $kit_settings['variable_colors'] ) ) {
				return 0;
			}
			
			return count( $kit_settings['variable_colors'] );
		} catch ( \Exception $e ) {
			return 0;
		}
	}
	
	private function sync_colors() {
		try {
			$kit = Plugin::$instance->kits_manager->get_active_kit();
			$color_variables = $this->get_v4_color_variables();
			
			if ( empty( $color_variables ) ) {
				return [
					'success' => false,
					'message' => 'No color variables found',
				];
			}
			
			$kit_settings = $kit->get_meta( PageManager::META_KEY );
			
			if ( ! $kit_settings ) {
				$kit_settings = [];
			}
			
			$variable_colors = [];
			
			foreach ( $color_variables as $color_var ) {
				$variable_colors[] = [
					'_id' => $color_var['id'],
					'title' => $color_var['label'],
					'color' => $color_var['value'],
				];
			}
			
			$kit_settings['variable_colors'] = $variable_colors;
			
			update_post_meta( $kit->get_id(), PageManager::META_KEY, $kit_settings );
			wp_cache_delete( $kit->get_id(), 'post_meta' );
			
			Plugin::$instance->files_manager->clear_cache();
			
			return [
				'success' => true,
				'added' => 0,
				'updated' => count( $variable_colors ),
				'total' => count( $color_variables ),
			];
		} catch ( \Exception $e ) {
			return [
				'success' => false,
				'message' => $e->getMessage(),
			];
		}
	}
}

new Sync_To_V3();

