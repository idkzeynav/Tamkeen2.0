const initialState = {
    wholesaleMarkets: [],
    loading: false,
    error: null,
    success: false,
    singleWholesaleMarket: null,
  };
  
  export const wholesaleMarketReducer = (state = initialState, action) => {
    switch (action.type) {
      // Get all markets
      case "getAllWholesaleMarketsRequest":
        return {
          ...state,
          loading: true,
        };
      case "getAllWholesaleMarketsSuccess":
        return {
          ...state,
          loading: false,
          wholesaleMarkets: action.payload,
        };
      case "getAllWholesaleMarketsFailed":
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Create market
      case "createWholesaleMarketRequest":
        return {
          ...state,
          loading: true,
        };
      case "createWholesaleMarketSuccess":
        return {
          ...state,
          loading: false,
          success: true,
          wholesaleMarkets: [...state.wholesaleMarkets, action.payload],
        };
      case "createWholesaleMarketFailed":
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // Update market
      case "updateWholesaleMarketRequest":
        return {
          ...state,
          loading: true,
        };
      case "updateWholesaleMarketSuccess":
        return {
          ...state,
          loading: false,
          wholesaleMarkets: state.wholesaleMarkets.map((market) =>
            market._id === action.payload._id ? action.payload : market
          ),
        };
      case "updateWholesaleMarketFailed":
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      case "clearErrors":
        return {
          ...state,
          error: null,
        };
  
      default:
        return state;
    }
  };
  