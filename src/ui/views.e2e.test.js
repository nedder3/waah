// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceRegistry } from '../core/registry.js';
import { MemoryAdapter } from '../core/storage.js';
import { S3Service } from '../services/s3/s3.js';
import { StoreService } from '../services/store/store.js';
import { IamService } from '../services/iam/iam.js';
import { LambdaService } from '../services/lambda/lambda.js';
import { Ec2Service } from '../services/ec2/ec2.js';
import { renderS3View } from './s3-view.js';
import { renderStoreView } from './store-view.js';
import { renderIamView } from './iam-view.js';
import { renderLambdaView } from './lambda-view.js';
import { renderEc2View } from './ec2-view.js';

// End-to-end exercise of every rewritten view through real DOM events, to prove
// the CRUD helper + sub-panels kept the original behavior intact.
function registryWith(views) {
  const reg = new ServiceRegistry();
  for (const [id, name, Svc, render] of views) {
    reg.register({ id, name, description: '', factory: (a) => new Svc(a), render });
  }
  return reg;
}
function mount(reg, id) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  const def = reg.get(id);
  def.render(root, reg.create(id, new MemoryAdapter(id)));
  return root;
}
const submit = (form) => form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
const click = (el) => el.dispatchEvent(new Event('click', { bubbles: true }));

describe('views e2e (rewritten over helper)', () => {
  beforeEach(() => localStorage.clear());

  it('S3: create bucket then object', () => {
    const reg = registryWith([['s3', 'S3', S3Service, renderS3View]]);
    const root = mount(reg, 's3');
    root.querySelector('#s3-name').value = 'b1';
    submit(root.querySelector('#s3'));
    expect(root.querySelector('#s3-list').textContent).toContain('b1');
    click([...root.querySelectorAll('#s3-list li button')].find((b) => b.textContent === 'abrir'));
    root.querySelector('#s3-object-key').value = 'a.txt';
    root.querySelector('#s3-object-body').value = 'hola';
    submit(root.querySelector('#s3-put-object'));
    expect(root.querySelector('#s3-object-list').textContent).toContain('a.txt');
  });

  it('Store: create table then item', () => {
    const reg = registryWith([['store', 'Store', StoreService, renderStoreView]]);
    const root = mount(reg, 'store');
    root.querySelector('#store-name').value = 'users';
    root.querySelector('#store-keyField').value = 'id';
    submit(root.querySelector('#store'));
    click([...root.querySelectorAll('#store-list li button')].find((b) => b.textContent === 'abrir'));
    root.querySelector('#store-item-json').value = '{"id":"1","n":"ana"}';
    submit(root.querySelector('#store-put-item'));
    expect(root.querySelector('#store-item-list').textContent).toContain('ana');
  });

  it('IAM: create user + role + attach shows role on user', () => {
    const reg = registryWith([['iam', 'IAM', IamService, renderIamView]]);
    const root = mount(reg, 'iam');
    root.querySelector('#iam-user-name').value = 'ana';
    submit(root.querySelector('#iam-user'));
    root.querySelector('#iam-role-name').value = 'admin';
    submit(root.querySelector('#iam-role-form'));
    root.querySelector('#iam-attach-user').value = 'ana';
    root.querySelector('#iam-attach-role').value = 'admin';
    submit(root.querySelector('#iam-attach-form'));
    expect(root.querySelector('#iam-user-list').textContent).toContain('admin');
  });

  it('Lambda: create function then invoke logs a request', () => {
    const reg = registryWith([['lambda', 'Lambda', LambdaService, renderLambdaView]]);
    const root = mount(reg, 'lambda');
    root.querySelector('#lambda-name').value = 'f1';
    root.querySelector('#lambda-runtime').value = 'node18';
    submit(root.querySelector('#lambda'));
    click([...root.querySelectorAll('#lambda-list li button')].find((b) => b.textContent === 'abrir'));
    root.querySelector('#lambda-input').value = '{"x":1}';
    submit(root.querySelector('#lambda-invoke-form'));
    expect(root.querySelector('#lambda-inv-list').textContent).toContain('req-');
  });

  it('EC2: launch instance then stop', () => {
    const reg = registryWith([['ec2', 'EC2', Ec2Service, renderEc2View]]);
    const root = mount(reg, 'ec2');
    root.querySelector('#ec2-type').value = 't2.micro';
    submit(root.querySelector('#ec2'));
    const row = root.querySelector('#ec2-list li');
    expect(row.textContent).toContain('running');
    click([...row.querySelectorAll('button')].find((b) => b.textContent === 'stop'));
    expect(root.querySelector('#ec2-list li').textContent).toContain('stopped');
  });
});
