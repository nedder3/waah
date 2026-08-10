import { StoreService } from './store.js';
import { renderStoreView } from '../../ui/store-view.js';

export const store = {
  id: 'store',
  name: 'Store',
  description: 'Tablas key-value (Dynamo-like)',
  ServiceClass: StoreService,
  render: renderStoreView,
};
