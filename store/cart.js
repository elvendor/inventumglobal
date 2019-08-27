export default {
  state: {
    orders: []
  },
  mutations: {
    ADD_ORDER(state, data){
      state.orders.push(data)
    },
    ADD_HOTEL(state, data) {
      state.orders[data.order].hotels.push(data.hotel)
    },
    INIT_CART(state) {
      let orders = localStorage.getItem('cart')
      orders = JSON.parse(orders)
      console.log(orders)
      if (orders && orders.length) {
        orders.forEach(order => {
          state.orders.push(order)
        })
      }
    },
    CLEAN_CART(state) {
      localStorage.removeItem('cart')
      state.orders = []
    }
  },
  actions: {
    addHotel({ state, commit, dispatch }, data) {
      let idx = state.orders.findIndex(o => 
        o.from === data.from &&
        o.to === data.to &&
        o.product_id === data.product_id &&
        o.departure_date === data.departure_date && 
        o.arrival_date === data.arrival_date
      )

      if(idx === -1) {
        let newOrder = {
          hotels: [data.hotel],
          note: '',
          ...data 
        }
        delete newOrder.hotel
        commit('ADD_ORDER', newOrder)
      } else {
        let order = state.orders[idx]
        if(order.hotels.length >= 10){
          commit(
            'snackbar/showSnackbar',
            {
              message: 'You can add maximum 10 hotels',
              color: 'red'
            },
            { root: true }
          )
        } else {
          if(!!order.hotels.find(h => h.id === data.hotel.id)){
            commit(
              'snackbar/showSnackbar',
              {
                message: 'The hotel has been already added',
                color: 'red'
              },
              { root: true }
            )
          } else {
            commit('ADD_HOTEL', { order: idx, hotel: data.hotel })
          }
        }
      }

      dispatch('updateStorage')

      commit(
        'snackbar/showSnackbar',
        {
          message: 'The hotel has been succesfully added',
          color: 'green'
        },
        { root: true }
      )
    },
    updateStorage({ state }) {
      localStorage.setItem('cart', JSON.stringify(state.orders))
    },
    removeHotel({ state, dispatch }, data) {
      state.orders[data.order].hotels.splice(data.hotel, 1)
      dispatch('updateStorage')
    }
  }
}
