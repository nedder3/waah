// IamService: users, roles and policies (AWS-IAM-flavored, prototype-grade).
// Pure logic — no DOM. Persists via StorageAdapter.
//
// Model (simplified):
//   - User: named principal. May have 0..n attached roles.
//   - Role: named principal with an attached policy document.
//   - Policy: { statements: [{ effect, action, resource }] }. Stored per role.
//
// Storage keys:
//   user:<name>            -> JSON user record
//   role:<name>            -> JSON role record
//   policy:<name>          -> JSON policy document
//   user-roles:<userName>  -> JSON array of role names

const USER_PREFIX = 'user:';
const ROLE_PREFIX = 'role:';
const POLICY_PREFIX = 'policy:';
const USER_ROLES_PREFIX = 'user-roles:';
const NAME_RE = /^[a-z0-9][a-z0-9.\-_]*$/;

export class IamService {
  constructor(adapter) {
    this._store = adapter;
  }

  _userKey(name) { return `${USER_PREFIX}${name}`; }
  _roleKey(name) { return `${ROLE_PREFIX}${name}`; }
  _policyKey(name) { return `${POLICY_PREFIX}${name}`; }
  _userRolesKey(name) { return `${USER_ROLES_PREFIX}${name}`; }

  // ---- Users ----
  createUser(name) {
    if (!NAME_RE.test(name)) throw new Error(`Invalid user name: "${name}".`);
    const k = this._userKey(name);
    if (this._store.get(k) !== null) return false;
    this._store.set(k, JSON.stringify({ name, createdAt: Date.now() }));
    this._store.set(this._userRolesKey(name), JSON.stringify([]));
    return true;
  }

  listUsers() {
    return this._store.keys(USER_PREFIX).map((k) => JSON.parse(this._store.get(k)).name).sort();
  }

  deleteUser(name) {
    const k = this._userKey(name);
    if (this._store.get(k) === null) return;
    this._store.delete(this._userRolesKey(name));
    this._store.delete(k);
  }

  _assertUser(name) {
    if (this._store.get(this._userKey(name)) === null) throw new Error(`User "${name}" not found.`);
  }

  // ---- Roles ----
  createRole(name) {
    if (!NAME_RE.test(name)) throw new Error(`Invalid role name: "${name}".`);
    const k = this._roleKey(name);
    if (this._store.get(k) !== null) return false;
    this._store.set(k, JSON.stringify({ name, createdAt: Date.now() }));
    return true;
  }

  listRoles() {
    return this._store.keys(ROLE_PREFIX).map((k) => JSON.parse(this._store.get(k)).name).sort();
  }

  deleteRole(name) {
    const k = this._roleKey(name);
    if (this._store.get(k) === null) return;
    // Detach from any users that had it.
    for (const u of this.listUsers()) {
      const roles = JSON.parse(this._store.get(this._userRolesKey(u)));
      if (roles.includes(name)) this.detachRole(u, name);
    }
    this._store.delete(this._policyKey(name));
    this._store.delete(k);
  }

  _assertRole(name) {
    if (this._store.get(this._roleKey(name)) === null) throw new Error(`Role "${name}" not found.`);
  }

  // ---- Policies ----
  putPolicy(roleName, policy) {
    this._assertRole(roleName);
    if (typeof policy !== 'object' || policy === null || !Array.isArray(policy.statements)) {
      throw new TypeError('Policy must be an object with a "statements" array.');
    }
    this._store.set(this._policyKey(roleName), JSON.stringify(policy));
  }

  getPolicy(roleName) {
    const raw = this._store.get(this._policyKey(roleName));
    return raw === null ? null : JSON.parse(raw);
  }

  // ---- Attach / detach ----
  attachRole(userName, roleName) {
    this._assertUser(userName);
    this._assertRole(roleName);
    const roles = JSON.parse(this._store.get(this._userRolesKey(userName)));
    if (!roles.includes(roleName)) roles.push(roleName);
    this._store.set(this._userRolesKey(userName), JSON.stringify(roles));
  }

  detachRole(userName, roleName) {
    this._assertUser(userName);
    const roles = JSON.parse(this._store.get(this._userRolesKey(userName))).filter((r) => r !== roleName);
    this._store.set(this._userRolesKey(userName), JSON.stringify(roles));
  }

  rolesOf(userName) {
    this._assertUser(userName);
    return JSON.parse(this._store.get(this._userRolesKey(userName))).sort();
  }
}
