// Central service catalog. Adding a service = drop its folder with an index.js
// exporting { id, name, description, ServiceClass, render } and add it here.
import { s3 } from './s3/index.js';
import { store } from './store/index.js';
import { iam } from './iam/index.js';
import { lambda } from './lambda/index.js';
import { ec2 } from './ec2/index.js';

export const SERVICES = [s3, store, iam, lambda, ec2];
