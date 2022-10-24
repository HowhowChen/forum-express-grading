const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      order: [[Comment, 'createdAt', 'DESC']]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.increment('viewCounts', { by: 1 })
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(f => f.id === req.user.id)

        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant, { model: Restaurant, include: Category }],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        const restaurantsData = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50) + '...'
        }))

        const commentsData = comments.map(r => ({
          ...r,
          text: r.text.substring(0, 50) + '...'
        }))

        res.render('feeds', {
          restaurants: restaurantsData,
          comments: commentsData
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      limit: 10,
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        const data = restaurants
          .map(r => ({
            ...r.toJSON(),
            description: r.description.substring(0, 50),
            favoritedCount: r.FavoritedUsers.length,
            isFavorited: req.user && req.user.FavoritedRestaurants.some(f => f.id === r.id)
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)

        res.render('top-restaurants', { restaurants: data })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
