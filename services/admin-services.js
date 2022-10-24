const { Restaurant, Category } = require('../models')

const adminServices = {
  getRestaurants: (req, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => callback(null, { restaurants }))
      .catch(err => callback(err))
  },
  deleteRestaurant: (req, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }

        return restaurant.destroy()
      })
      .then(deleteRestaurant => callback(null, { restaurant: deleteRestaurant }))
      .catch(err => callback(err))
  }
}

module.exports = adminServices
