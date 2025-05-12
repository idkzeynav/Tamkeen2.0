import React from 'react'
import Header from "../components/Layout/Header";
import Hero from '../components/Route/Hero/Hero';
import Categories from "../components/Route/Categories/Categories";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Footer from "../components/Layout/Footer";
import Avatar from '../components/Chatbot/Avatar';
import Explore from '../components/Route/ExploreUs/explore';
import Whyus from '../components/Route/whychooseus/whychooseus';
import FAQPage from './FAQPage';
const HomePage = () => {
    return (
        <div>
            <Header activeHeading={1} />
            <Hero />
            <Explore />
            <Whyus />
            <FAQPage />
            <Avatar/>
            <Footer />
        </div>
    )
}

export default HomePage