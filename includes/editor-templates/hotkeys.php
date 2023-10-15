<?php
namespace Elementor;

use Elementor\Core\Editor\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$is_editor_v2_active = Plugin::$instance->experiments->is_feature_active( Editor::EDITOR_V2_EXPERIMENT_NAME );
?>
<script type="text/template" id="tmpl-elementor-hotkeys">
	<# var ctrlLabel = environment.mac ? '&#8984;' : 'Ctrl'; #>
	<div id="elementor-hotkeys__content">

		<div class="elementor-hotkeys__col">

			<div class="elementor-hotkeys__header">
				<h3><?php echo esc_html__( 'Actions', 'elementor' ); ?></h3>
			</div>

			<div class="elementor-hotkeys__list">

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Undo', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Z</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Redo', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>Z</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Copy', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>C</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Paste', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>V</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Paste Style', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>V</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Delete', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Delete</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Duplicate', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>D</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Save', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>S</span>
					</div>
				</div>

			</div>

		</div>

		<div class="elementor-hotkeys__col">

			<div class="elementor-hotkeys__header">
				<h3><?php echo esc_html__( 'Panels', 'elementor' ); ?></h3>
			</div>

			<div class="elementor-hotkeys__list">

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Finder', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>E</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Show / Hide Panel', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>P</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Site Settings', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>K</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php
						echo $is_editor_v2_active
							? esc_html__( 'Structure', 'elementor' )
							: esc_html__( 'Navigator', 'elementor' );
					?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>I</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Page Settings', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>Y</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'History', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>H</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'User Preferences', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>U</span>
					</div>
				</div>

			</div>

		</div>

		<div class="elementor-hotkeys__col">

			<div class="elementor-hotkeys__header">
				<h3><?php echo esc_html__( 'Go To', 'elementor' ); ?></h3>
			</div>

			<div class="elementor-hotkeys__list">

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Responsive Mode', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>M</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Template Library', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>L</span>
					</div>
				</div>

				<?php if ( Plugin::$instance->experiments->is_feature_active( 'notes' ) ) : ?>
				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Notes', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Shift</span>
						<span>C</span>
					</div>
				</div>
				<?php endif ?>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Keyboard Shortcuts', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Shift</span>
						<span>?</span>
					</div>
				</div>

				<div class="elementor-hotkeys__item">
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Quit', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>Esc</span>
					</div>
				</div>

			</div>

		</div>

	</div>
</script>
