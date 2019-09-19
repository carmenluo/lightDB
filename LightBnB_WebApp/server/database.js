const db = require('../db/index');
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  let user;
  const queryString = `
  select *
  from users
  where email = $1;
  `
  return db.query(queryString, [email])
    .then(res => {
      if (res.rows.length > 0) {
        return (res.rows[0])
      }
      else return "Null";
    }).catch(err => (`query error: ${err}`));
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `
  select *
  from users
  where id = $1;
  `
  return db.query(queryString, [id])
    .then(res => {
      if (res.rows.length > 0) {
        return (res.rows[0])
      }
      else return "Null";
    }).catch(err => ('query error'));
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const values = [user.name, user.email, user.password]
  const queryString = `INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`
  return db.query(queryString, values)
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
const getAllReservations = function (guest_id, limit = 10) {
  // const queryString = `
  // select reservations.*
  // from users join reservations on user.id = reservations.guest_id
  // where guest_id = $1 AND reservations.end_date < now() :: date;
  // `
  // db.query(queryString,[guest_id])
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
 db.query(queryString, values)
    .then(res => (res.rows))
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
const getAllProperties = function (options, limit = 10) {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(parseInt(options.owner_id));
    queryString += `WHERE owner_id = $${queryParams.length}`
  }
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(parseInt(options.minimum_price_per_night));
    queryParams.push(parseInt(options.maximum_price_per_night));
    if (queryParams.length > 2) {
      queryString += `AND cost_per_night > $${queryParams.length - 1} AND cost_per_night < $${queryParams.length}`;
    } else {
      queryString += `WHERE cost_per_night > $${queryParams.length - 1} AND cost_per_night < $${queryParams.length}`;
    }
  }
  queryString += `
  GROUP BY properties.id
  `;
  if (options.minimum_rating) {
    queryParams.push(parseInt(options.minimum_rating));
    queryString += `
    HAVING avg(property_reviews.rating) >= $${queryParams.length}
    `;
  }
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};`
  console.log(queryString, queryParams);

  return db.query(queryString, queryParams)
    .then(res => res.rows);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
const values = [
  property.owner_id,
  property.title,
  property.description,
  property.thumbnail_photo_url,
  property.cover_photo_url,
  property.cost_per_night,
  property.street,
  property.city,
  property.province,
  property.post_code,
  property.country,
  property.parking_spaces,
  property.number_of_bathrooms,
  property.number_of_bedrooms
];
const queryString = 
`INSERT INTO properties (owner_id,title, description,thumbnail_photo_url, cover_photo_url, cost_per_night,street,city, province,post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`
return db.query(queryString, values)
.then(res => res.rows)
.catch(err => console.log('query error', err.stack))
}
exports.addProperty = addProperty;
