import { IamService } from './iam.js';
import { renderIamView } from '../../ui/iam-view.js';

export const iam = {
  id: 'iam',
  name: 'IAM',
  description: 'Usuarios, roles y policies',
  ServiceClass: IamService,
  render: renderIamView,
};
