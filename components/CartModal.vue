<template lang='pug'>
  v-card(color='#F6F8FB').cart-page
    v-card(color='#fff').main-card
      h1.display-2.font-weight-bold Order: new

      v-row.mt-4
        v-col(md='7' cols='12')
          p.cart-page__title Dates
          .dates-row
            v-menu(v-model="menu1" :close-on-content-click="false" full-width max-width="290")
              template(v-slot:activator="{ on }")
                v-text-field(:value="formattedDateIn" hide-details outlined clearable label="Check in" readonly v-on="on")
              v-date-picker(v-model="form.departure_date" @change="menu1 = false" no-title :events='[form.arrival_date]' event-color='#3273C2' :show-current='false') 

            v-menu(v-model="menu2" :close-on-content-click="false" full-width max-width="290")
              template(v-slot:activator="{ on }")
                v-text-field(:value="formattedDateOut" hide-details outlined label="Check out" readonly v-on="on")
              v-date-picker(v-model="form.arrival_date" @change="menu2 = false" no-title :events='[form.departure_date]' event-color='#3273C2' :show-current='false')

          p.cart-page__title.mt-4 Locations
          .locations
            .locations__item
              v-icon.locations-item__icon mdi-airplane-takeoff
              //span.locations-item__name(v-text='form.from.name')
            .locations__item
              v-icon.locations-item__icon mdi-airplane-landing
              //span.locations-item__name(v-text='form.to.name')


        v-col(lg='3' md='4' sm='6' cols='12' offset-md='1')
          p.cart-page__title Event size
          .event-size
            .event-size__field-group
              span.group__name Single rooms:
              .control.plus(@click='decr("single")'): v-icon mdi-minus
              v-text-field(v-model='form.single' @input='recalc()' placeholder="0" solo hide-details flat).group__input
              .control.plus(@click='incr("single")'): v-icon mdi-plus
            .event-size__field-group
              span.group__name Double rooms:
              .control.plus(@click='decr("double")'): v-icon mdi-minus
              v-text-field(v-model='form.double' @input='recalc()' placeholder="0" solo hide-details flat).group__input
              .control.plus(@click='incr("double")'): v-icon mdi-plus
            .event-size__field-group
              span.group__name Triple rooms:
              .control.plus(@click='decr("triple")'): v-icon mdi-minus
              v-text-field(v-model='form.triple' @input='recalc()' placeholder="0" solo hide-details flat).group__input
              .control.plus(@click='incr("triple")'): v-icon mdi-plus
            .event-size__field-group
              span.group__name Total Pax:
              .control.plus(@click='decr("pax")'): v-icon mdi-minus
              v-text-field(v-model='form.pax' @input='recalc(`pax`)' placeholder="0" solo hide-details flat).group__input
              .control.plus(@click='incr("pax")'): v-icon mdi-plus
        

      v-row.mt-8
        v-col(cols='12').hotels-list
          p.cart-page__title Hotels
          .empty(v-if='loaded && form.hotels.length == 0') No hotels
          v-card(:loading='!loaded' elevation='0')
            v-list-item(v-for='(hotel, index) in form.hotels' :key='index' )
              span.hotel-numering(v-text='index+1')
              img(src='/img/home/ecommerce.png').hotel-image
              .middle-part
                v-list-item-title
                  a(:href='`/hotel/${hotel.id}`' target='_blank' v-text='hotel.name').hotel-title
                span(v-text='hotel.region').hotel-region
              v-spacer
              .hotel-pricing
                v-radio-group(v-model="form.hotels[index].product_id" hide-details)
                  v-radio(:value="1" label="M.I.C.E")
                  v-radio(:value="2" label="Wedding")
              v-btn(icon @click='removeHotel(index, hotel.id)' v-if='!$vuetify.breakpoint.xs')
                v-icon mdi-close
              v-btn(@click='removeHotel(index, hotel.id)' v-else text color='error') Remove

      v-row.mt-8
        v-col(cols='12')
          p.cart-page__title Note
          v-textarea(v-model='form.agency_note' outlined placeholder='Type your note here' hide-details)

      v-row
        v-col
          v-checkbox(v-model='agree' label='I agree that...')

      v-row
        v-col
          v-btn(color='primary' x-large @click='send').custom Send order



</template>

<script>
import HotelStars from '@/components/HotelStars'
import { mapState, mapActions, mapMutations } from 'vuex'
import Hotel from '@/models/Hotel'
import _ from 'lodash'

export default {
  data: () => ({
    form: {
      from: {
        name: '',
        id: 2
      },
      to: {
        name: '',
        id: 1
      },
      departure_date: new Date().toISOString().substr(0, 10),
      arrival_date: new Date().toISOString().substr(0, 10),
      hotels: [],
      single: 0,
      triple: 0,
      double: 0,
      pax: 0,
      agency_note: ''
    },
    agree: false,
    menu1: false,
    menu2: false,
    loaded: false
  }),
  async created() {
    let cart = { ...this.$store.getters['cart/cart'] }

    this.form = _.pick(cart, [
      'from',
      'to',
      'departure_date',
      'arrival_date',
      'single',
      'triple',
      'double',
      'hotels',
      'pax'
    ])
    this.loaded = true
  },

  computed: {
    formattedDateIn() {
      return this.form.departure_date
        ? this.$dayjs(this.form.departure_date).format('dddd, MMMM D, YYYY')
        : ''
    },
    formattedDateOut() {
      return this.form.arrival_date
        ? this.$dayjs(this.form.arrival_date).format('dddd, MMMM D, YYYY')
        : ''
    }
  },
  methods: {
    ...mapActions({ removeHotelFromCart: 'cart/removeHotel' }),
    ...mapMutations({ cleanCart: 'cart/CLEAN_CART' }),
    send() {
      if (!this.validate()) return false

      this.cleanCart()
      this.$toast.success('Order has been sent')
      this.$emit('close')
    },
    validate() {
      let errors = 0

      let datesDiff = this.$dayjs(this.form.arrival_date).diff(
        this.$dayjs(this.form.departure_date),
        'days'
      )

      if (datesDiff < 1) {
        errors++
        this.$toast.error(`Arrival date must be later than departure date`)
      }

      if (datesDiff > 3) {
        errors++
        this.$toast.error(
          `Possible trip duration: 1-3 days (now: ${datesDiff})`
        )
      }

      return !errors
    },
    removeHotel(index, id) {
      this.removeHotelFromCart(id)
    },
    incr(index) {
      this.form[index]++
      this.recalc(index)
    },
    decr(index) {
      let value = this.form[index]
      if (value > 0) this.form[index]--
      this.recalc(index)
    },
    recalc(e) {
      if (e == 'pax') {
        this.form.single = 0
        this.form.double = this.form.pax > 0 ? Math.ceil(this.form.pax / 2) : 0
        this.form.triple = 0
      } else {
        this.form.pax =
          Number(this.form.single) +
          Number(this.form.double * 2) +
          Number(this.form.triple * 3)
      }
    }
  },
  components: {
    HotelStars
  }
}
</script>
<style lang="sass">
  @import '@/assets/styles/components/cart.sass'
</style>