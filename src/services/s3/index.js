import { S3Service } from './s3.js';
import { renderS3View } from '../../ui/s3-view.js';

export const s3 = {
  id: 's3',
  name: 'S3-like',
  description: 'Buckets y objetos',
  ServiceClass: S3Service,
  render: renderS3View,
};
