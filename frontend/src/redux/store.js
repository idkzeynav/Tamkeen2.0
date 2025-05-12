import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user";
import { sellerReducer } from "./reducers/seller";
import { productReducer } from "./reducers/product";
import { cartReducer } from "./reducers/cart";
import { wishlistReducer } from "./reducers/wishlist";
import { orderReducer } from "./reducers/order";
import { serviceReducer } from "./reducers/servicesReducer"; 
import { bookingReducer } from "./reducers/bookingReducer";
import { bulkOrderReducer } from "./reducers/bulkOrderReducer";
import { wholesaleMarketReducer } from "./reducers/wholesaleMarketReducer";
const Store = configureStore({
  reducer: {
    // Reducers
    user: userReducer,
    seller: sellerReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    services: serviceReducer,
     bookings: bookingReducer, 
     bulkOrderReducer:bulkOrderReducer,
     wholesaleMarket: wholesaleMarketReducer,
   
  },
});

export default Store;
