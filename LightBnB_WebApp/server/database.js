const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightdb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  let user;
  const queryString = `
  select *
  from users
  where email = $1;
  `
  return pool.query(queryString, [email])
  .then(res => {
    if (res.rows.length > 0){
    return (res.rows[0])}
    else return "Null";
  }).catch(err => (`query error: ${err}`));
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `
  select *
  from users
  where id = $1;
  `
  return pool.query(queryString, [id])
  .then(res => {
    if (res.rows.length > 0){
    return (res.rows[0])}
    else return "Null";
  }).catch(err => ('query error'));
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const values = [user.name, user.email, user.password]
  const queryString = `INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`
  return pool.query(queryString, values)
    .then(res => res.rows[0])
    .catch(err => console.log('query error', err.stack))
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  // const queryString = `
  // select reservations.*
  // from users join reservations on user.id = reservations.guest_id
  // where guest_id = $1 AND reservations.end_date < now() :: date;
  // `
  // pool.query(queryString,[guest_id])
  // .then(res => {
  //   res.rows
  // })
  // .catch(err => console.log(`query error ${err.stack}`));
  const queryString = `SELECT reservations.*, properties.*
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.end_date < now()::date AND reservations.guest_id = $1
GROUP BY reservations.id, properties.id, property_reviews.id
ORDER BY reservations.start_date
LIMIT $2`;
  const values = [guest_id, limit];
  pool.query(queryString, values)
    .then(res => console.log(res.rows))
    .catch(err => console.log('query error', err.stack))

}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  const queryString = `
  SELECT * FROM properties
  LIMIT $1
  `
  pool.query(queryString, [limit])
  .then(res => {
    (res.rows)
  })
  .catch(err => console.log('query error', err.stack));
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
