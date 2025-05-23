# Screenshotter

ScreenShotter automates visual regression testing of your responsive web UI by comparing DOM screenshots over time.

This is an internal tool that's being used in Elementor's CI process, in order to make sure that the PR changes don't
break the original behavior of the product.

## Features:
- Install & Configure a WordPress environment automatically.
- Set layout, screen size and device settings.
- Get a visual diff inspector.
- Simulate user interactions with Puppeteer scripts.

## Usage:

### How to Create a Template:
1. Go to Elementor's "Templates" category in the wp-admin Dashboard.
2. Click on "Add New".
3. In the opened popup, select "Page" as type, and the name of the widget you're testing as a name.
4. After the Editor is loaded, drag the widget you are testing, and add as many variations/combinations of controls as possible.
5. Add an explanatory title (e.g. with the name of the control) that represents each block of control values/options/variations.
   (Example: For Button widget, create a title called "Type" and drag 5 buttons. In each button, set the text to the 
   control value you are currently testing: "Default", "Info", etc.). 
6. When finished, go back to the "Templates" page in the Dashboard and export the template you've just created into a JSON file.
   (Hover over the name and click "Export Template").
7. After exporting, rename the downloaded file to the name of the widget you're testing (e.g. "button.json") and move it to 
   the `/tests/screenshotter/config` directory of the plugin.
8. Go to the `/tests/screenshotter/config.json` file and add your JSON file to the `templates` array (ordered alphabetically).
9. Push your changes to github, and wait for the ScreenShotter CI workflow to finish.
10. Go to the ScreenShotter artifacts and download the ZIP file.
11. From the ZIP file, extract the reference images under the `/bitmaps_test` directory (e.g. `button_phone.png`).
12. Make sure everything looks correctly, copy those reference images to the `/tests/screenshotter/reference` directory, and push the changes.
13. The CI should pass now and the screenshots should be valid.

### Guidelines:
- Don't use global fonts/colors.
- Test one widget per template.
- Template name should be the same as the widget you are testing.
- Make the tests easy to debug:
  - Organize control configurations under sections with explanatory titles.
  - Add text to explain what exactly changed in each instance.
  - Don't add unnecessary controls/values if they don't contribute to the test.
