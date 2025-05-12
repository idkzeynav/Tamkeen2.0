import React, { useState } from "react";
import "./App.css";
import Store from "./redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
  UserBulkOrders,
  UserBulkOrderDetails,
 BulkOrderOffers,
 OfferDetails,
 BulkOrderPaymentPage,
 ProcessingOrdersPage,
 ProcessingOrderDetail,
 WorkshopDetails,
UserWorkshops,
WorkshopQuiz,
CreatePostPage,
PostDetailsPage,
Certificate,
CertificateVerification,
SearchResults,
} from "./routes/Routes";
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopSettingsPage,
  ShopInboxPage,
  ShopCreateService, 
  ShopAllServices,   
  ShopBookings,
  ShopBulkOrders,
  ShopAcceptedBulkOrders,
  FinalBulkOrder
} from "./routes/ShopRoutes";

import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,

  CreateWorkshop,
  WorkshopList,
  Adminworkshopdetail,
} from "./routes/AdminRoutes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { loadSeller, loadUser } from "./redux/actions/user";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import SellerProtectedRoute from "./routes/SellerProtectedRoute";
import { ShopHomePage } from "./ShopRoutes";
import { getAllProducts } from "./redux/actions/product";
import { getAllServices, getAllServicesShop } from "./redux/actions/service";
import axios from "axios";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ServiceDetailPage from "./components/Services/ServiceDetail";
import AllServicesPage from "./pages/Servicepage";
import ServiceDetailShopPage from "./components/Shop/ServiceDetailshop";
import UserBookingPage from "./components/Booking/Bookingpage";
import BulkOrderForm from "./components/Procurement/Bulkorderform";
import BulkOrderDetails from "./components/Shop/bulkOrderDetail";
import WholesaleMarketForm from './components/Wholesale/WholesaleMarketForm';
import ForumPage from "./pages/ForumPage";

import WholesaleMarketManagement from "./components/Wholesale/wholesaleMarket";
import ViewWholesaleMarkets from "./components/Wholesale/viewWholesale";
import AdminDashboardMain from './components/Admin/AdminDashboardMain';
import UserWorkshopView from "./components/workshop/userworkshops";
import AdminWholesaleMarketsPage from "./pages/AdminWholsesaleMarketsPage";
import SalesAnalysis from "./components/Analysis/SalesAnalysis";

import Explore from "./components/Route/ExploreUs/explore";
import ForgotPassword from "./components/Password/ForgotPassword";
import ResetPassword from "./components/Password/ResetPassword";

const App = () => {
  const [stripeApikey, setStripeApiKey] = useState("");

  async function getStripeApikey() {
    const { data } = await axios.get(`${server}/payment/stripeapikey`);
    console.log("Stripe API Key:", data.stripeApikey);
    setStripeApiKey(data.stripeApikey);
  }

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllServicesShop()); 
    Store.dispatch(getAllServices());
    getStripeApikey();
  }, []);

  return (
    <BrowserRouter>
      {stripeApikey && (
        <Elements stripe={loadStripe(stripeApikey)}>
          <Routes>
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage/>
                </ProtectedRoute>
              }
            />
          </Routes>

          <Routes>
            <Route
              path="/bulkorderpayment/:rfqId"
              element={
                <ProtectedRoute>
                  <BulkOrderPaymentPage/>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Elements>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sales-analysis" element={<SalesAnalysis />} />
        <Route path="/search" element={<SearchResults />}  />
        
        <Route
          path="/activation/:activation_token"
          element={<ActivationPage />}
        />
        <Route
          path="/seller/activation/:activation_token"
          element={<SellerActivationPage />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/Workshops" element={<UserWorkshopView/>} />
        <Route path="/servicess" element={<AllServicesPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<Explore />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:postId" element={<PostDetailsPage />} />
          <Route path="/forum/:postId" element={<PostDetailsPage />} />
       
        <Route
    path="/forum/create-post"
    element={
      <ProtectedRoute>
        <CreatePostPage />
      </ProtectedRoute>
    }
  />

<Route path="/forgot-password/:type" element={<ForgotPassword />} />
<Route path="/reset-password/:type/:token" element={<ResetPassword />} />
        
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
   <Route
              path="/Userworkshops"
              element={
                <ProtectedRoute>
                  <UserWorkshops/>
                </ProtectedRoute>
              }
            />
<Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

<Route
          path="/workshop/:id/quiz"
          element={
            <ProtectedRoute>
              <WorkshopQuiz />
            </ProtectedRoute>
          }
        />


<Route
  path="/workshop/generate-certificate/:workshopId"
  element={
    <ProtectedRoute>
      <Certificate />
</ProtectedRoute>    
  }
/> 

 {/* <Route path="/certificate/:workshopId" element={
  <Certificate />} /> */}


<Route 
  path="/verify-certificate/:certificateId" 
  element={<CertificateVerification />}
/>

<Route
  path="/payment/certificate-payment-status/:workshopId"
  element={
    <ProtectedRoute>
      <Certificate />
    </ProtectedRoute>
  }
/>

<Route
 path="/workshop/:workshopId/certificate"
 element={<ProtectedRoute>
  <Certificate />
</ProtectedRoute>} 
/>

<Route
path="/payment/initiate-certificate-payment/:workshopId"
element={
  <ProtectedRoute>
    <Certificate />
  </ProtectedRoute>
}
/>


  <Route
          path="/processing-Orders"
          element={
            <ProtectedRoute>
              <ProcessingOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <UserInbox />
            </ProtectedRoute>
          }
        />

<Route
          path="/wholesale-management"
          element={<WholesaleMarketManagement />}
        />
        <Route
          path="/wholesale-markets"
          element={<ViewWholesaleMarkets />}
        />

        <Route path="/admin" element={<AdminDashboardMain />} />
        <Route path="/admin-wholesale-markets" element={<AdminWholesaleMarketsPage />} />
        <Route path="/admin-wholesale-markets/create" element={<WholesaleMarketForm />} />
        <Route path="/admin-wholesale-markets/update/:id" element={<WholesaleMarketForm />} />
         <Route
          path="/userBulk"
          element={
            <ProtectedRoute>
              <UserBulkOrders />
            </ProtectedRoute>
          }
        />
   <Route
          path="/userdetails/:orderId"
          element={
            <ProtectedRoute>
              <UserBulkOrderDetails />
            </ProtectedRoute>
          }
        />

<Route
          path="/offer-details/:rfqId"
          element={
            <ProtectedRoute>
              <OfferDetails />
            </ProtectedRoute>
          }
        />



        <Route
          path="/user/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
           <Route
          path="/workshopdetail/:id"
          element={
            <ProtectedRoute>
              <WorkshopDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-order/:bulkOrderId/offers"
          element={
            <ProtectedRoute>
              <BulkOrderOffers/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/track/order/:id"
          element={
            <ProtectedRoute>
              <TrackOrderPage />
            </ProtectedRoute>
          }
        />

        
<Route
          path="/FinalBulkorder/details/:orderId"
          element={
            <ProtectedRoute>
              <ProcessingOrderDetail />
            </ProtectedRoute>
          }
        />
        
       
        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />
        <Route path="/serviceShop/:id" element={<ServiceDetailShopPage />} />
        <Route path="/booking" element={<UserBookingPage />} />
        <Route path="/bulkorder" element={<BulkOrderForm />} />

        {/* shop Routes */}
        <Route path="/shop-create" element={<ShopCreatePage />} />
        <Route path="/shop-login" element={<ShopLoginPage />} />
        <Route
          path="/shop/:id"
          element={
            <SellerProtectedRoute>
              <ShopHomePage />
            </SellerProtectedRoute>
          }
        />
       

        <Route
          path="/settings"
          element={
            <SellerProtectedRoute>
              <ShopSettingsPage />
            </SellerProtectedRoute>
          }
        />
 
        <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <ShopDashboardPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-product"
          element={
            <SellerProtectedRoute>
              <ShopCreateProduct />
            </SellerProtectedRoute>
          }
        />
          <Route
          path="/dashboard-create-service" // New route for creating services
          element={
            <SellerProtectedRoute>
              <ShopCreateService />
            </SellerProtectedRoute>
          }
        />
          <Route
          path="/bulk-order/:id" 
          element={
            <SellerProtectedRoute>
              <BulkOrderDetails />
            </SellerProtectedRoute>
          }
        />


 <Route
          path="/Finalbulk-order/:id" 
          element={
            <SellerProtectedRoute>
              <FinalBulkOrder />
            </SellerProtectedRoute>
          }
        />
<Route
          path="/sellerbulkorders" // New route for creating services
          element={
            <SellerProtectedRoute>
              <ShopAcceptedBulkOrders />
            </SellerProtectedRoute>
          }
        />

<Route
          path="/RFQ" // New route for creating services
          element={
            <SellerProtectedRoute>
              <ShopBulkOrders />
            </SellerProtectedRoute>
          }
        />
       

        <Route
          path="/dashboard-orders"
          element={
            <SellerProtectedRoute>
              <ShopAllOrders />
            </SellerProtectedRoute>
          }
        />

n

        <Route
          path="/order/:id"
          element={
            <SellerProtectedRoute>
              <ShopOrderDetails />
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-products"
          element={
            <SellerProtectedRoute>
              <ShopAllProducts />
            </SellerProtectedRoute>
          }
        /> 
          <Route
          path="/dashboard-services" // New route for listing all services
          element={
            <SellerProtectedRoute>
              <ShopAllServices />
            </SellerProtectedRoute>
          }
        />


        <Route
          path="/dashboard-messages"
          element={
            <SellerProtectedRoute>
              <ShopInboxPage />
            </SellerProtectedRoute>
          }
        />

      
          <Route
          path="/dashboard-sellerbooking"
          element={
            <SellerProtectedRoute>
              <ShopBookings />
            </SellerProtectedRoute>
          }
        />
      
    

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />

            {/* Admin Routes */}
            <Route
          path="/createworkshop"
          element={
            <ProtectedAdminRoute>
              <CreateWorkshop />
            </ProtectedAdminRoute>
          }
        />

<Route
          path="/Adminworkshop"
          element={
            <ProtectedAdminRoute>
              <WorkshopList/>
            </ProtectedAdminRoute>
          }
        />


<Route
          path="/workshop/:id" 
          element={
            <ProtectedAdminRoute>
              <Adminworkshopdetail/>
            </ProtectedAdminRoute>
          }
        />



        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardOrders />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardProducts />
            </ProtectedAdminRoute>
          }
        />
     
    
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
};
export default App;