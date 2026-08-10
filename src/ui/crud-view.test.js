// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderCrudView } from './crud-view.js';

function mount(config) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  renderCrudView(root, config);
  return root;
}

describe('renderCrudView (helper)', () => {
  let root;
  const baseConfig = () => ({
    title: 'Demo',
    formId: 'demo-form',
    fields: [{ name: 'name', placeholder: 'nombre' }],
    create: (vals) => `${vals.name}!`,
    list: () => [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }],
    onDelete: () => {},
    emptyText: 'sin items',
  });

  beforeEach(() => { root = mount(baseConfig()); });

  it('renders a title and a form with declared fields', () => {
    expect(root.querySelector('h3').textContent).toBe('Demo');
    expect(root.querySelector('#demo-form')).not.toBeNull();
    expect(root.querySelector('#demo-form-name')).not.toBeNull();
  });

  it('renders the item list from list()', () => {
    const items = root.querySelectorAll('#demo-form-list li');
    expect(items.length).toBe(2);
  });

  it('creates an item on submit and re-renders', () => {
    const created = [];
    const cfg = baseConfig();
    cfg.create = (vals) => { created.push(vals.name); return 'ok'; };
    cfg.list = () => [{ key: 'x', label: 'X' }];
    const r = mount(cfg);
    r.querySelector('#demo-form-name').value = 'hola';
    r.querySelector('#demo-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(created).toEqual(['hola']);
    expect(r.querySelector('#demo-form-list li').textContent).toContain('X');
  });

  it('calls onDelete when the trash button is clicked', () => {
    const deleted = [];
    const cfg = baseConfig();
    cfg.onDelete = (key) => deleted.push(key);
    const r = mount(cfg);
    r.querySelector('#demo-form-list li button.del').dispatchEvent(new Event('click', { bubbles: true }));
    expect(deleted).toEqual(['a']);
  });

  it('shows emptyText when list is empty', () => {
    const cfg = baseConfig();
    cfg.list = () => [];
    const r = mount(cfg);
    expect(r.querySelector('#demo-form-empty').textContent).toBe('sin items');
  });
});
