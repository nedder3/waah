import { Ec2Service } from './ec2.js';
import { renderEc2View } from '../../ui/ec2-view.js';

export const ec2 = {
  id: 'ec2',
  name: 'EC2',
  description: 'Instancias virtuales',
  ServiceClass: Ec2Service,
  render: renderEc2View,
};
