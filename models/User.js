const bcrypt = require('bcrypt');
const db = require('../config/database');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 12;
const UNIQUE_VIOLATION = '23505';
const PUBLIC_COLUMNS = 'id, name, email, role, created_at';
const DUMMY_HASH = bcrypt.hashSync('contrasena-de-relleno', SALT_ROUNDS);

class User {
  static async findById(id) {
    if (!Number.isInteger(id) || id < 1) {
      return null;
    }
    const { rows } = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS}, password_hash FROM users WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  static async create({ name, email, password, role = 'user' }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      const { rows } = await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING ${PUBLIC_COLUMNS}`,
        [name.trim(), email.trim().toLowerCase(), passwordHash, role]
      );
      return rows[0];
    } catch (err) {
      if (err.code === UNIQUE_VIOLATION) {
        throw new AppError(409, 'Ya existe una cuenta con ese correo');
      }
      throw err;
    }
  }

  static async authenticate(email, password) {
    const user = await User.findByEmail(email.trim().toLowerCase());
    const matches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !matches) {
      throw new AppError(401, 'Correo o contraseña incorrectos');
    }
    delete user.password_hash;
    return user;
  }

  static async ensureAdmin({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin'
       RETURNING ${PUBLIC_COLUMNS}`,
      [name, email.trim().toLowerCase(), passwordHash]
    );
    return rows[0];
  }
}

module.exports = User;
