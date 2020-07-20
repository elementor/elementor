import Layout from '../../templates/layout';
import Message from '../../ui/message/message';
import SelectFile from '../../shared/select-file/select-file';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Button from 'elementor-app/ui/molecules/button';
import Grid from 'elementor-app/ui/grid/grid';

import './import-failed.scss';

export default function ImportFailed() {
	return (
		<Layout type="import">
			<Message className="e-app-import-failed">
				<Grid container justify="space-evenly" className="none">
					<Grid item>
						<Heading variant="display-1">Display 1</Heading>
						<Heading variant="display-2">Display 2</Heading>
						<Heading variant="display-3">Display 3</Heading>
						<Heading variant="display-4">Display 4</Heading>
					</Grid>
					<Grid item>
						<Heading variant="h1">Heading 1</Heading>
						<Heading variant="h2">Heading 2</Heading>
						<Heading variant="h3">Heading 3</Heading>
						<Heading variant="h4">Heading 4</Heading>
						<Heading variant="h5">Heading 5</Heading>
						<Heading variant="h6">Heading 6</Heading>
					</Grid>
					<Grid item>
						<Text variant="xl">Text xl</Text>
						<Text variant="lg">Text lg</Text>
						<Text>Text</Text>
						<Text variant="sm">Text sm</Text>
						<Text variant="xs">Text xs</Text>
						<Text variant="xxs">Text xxs</Text>
					</Grid>
				</Grid>
				<div>
					<Icon className="e-app-import-failed__icon eicon-warning" />

					<Heading variant="display-3">
						{ __( 'File Upload Failed', 'elementor' ) }
					</Heading>

					<Text variant="md">
						{ __( 'File is invalid and could not be processed', 'elementor' ) }
						<br />
						<Button color="link" className="e-app-import-failed__click-here" text={ __( 'Click Here', 'elementor' ) } url="/#" />
						<span>{ __( 'to try solving the issue.', 'elementor' ) }</span>
					</Text>

					<SelectFile />
				</div>
			</Message>
		</Layout>
	);
}

