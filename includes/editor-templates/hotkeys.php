<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<script type="text/template" id="tmpl-elementor-hotkeys">
	<# var ctrlLabel = environment.mac ? '&#8984;' : 'Ctrl'; #>
	<div id="elementor-hotkeys__content">
		<div id="elementor-hotkeys__actions" class="elementor-hotkeys__col">

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

		<div id="elementor-hotkeys__navigation" class="elementor-hotkeys__col">

			<div class="elementor-hotkeys__header">
				<h3><?php echo esc_html__( 'Go To', 'elementor' ); ?></h3>
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
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Responsive Mode', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>Shift</span>
						<span>M</span>
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
					<div class="elementor-hotkeys__item--label"><?php echo esc_html__( 'Navigator', 'elementor' ); ?></div>
					<div class="elementor-hotkeys__item--shortcut">
						<span>{{{ ctrlLabel }}}</span>
						<span>I</span>
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
