import { LambdaService } from './lambda.js';
import { renderLambdaView } from '../../ui/lambda-view.js';

export const lambda = {
  id: 'lambda',
  name: 'Lambda',
  description: 'Funciones y ejecución',
  ServiceClass: LambdaService,
  render: renderLambdaView,
};
