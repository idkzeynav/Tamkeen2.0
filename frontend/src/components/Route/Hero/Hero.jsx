import React from 'react';
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";

const Hero = () => {
    return (
        <div
            className={`flex h-screen bg-cover bg-center relative min-h-[70vh] 800px:min-h-[80vh] w-full bg-no-repeat ${styles.noramlFlex}`}
            style={{
                backgroundImage: "url('https://dreamcreate.wordpress.com/wp-content/uploads/2014/09/lavender2.gif')", // Replace with your GIF path
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            


             <div className={`${styles.section} w-[90%] 800px:w-[75%] bg-[#c8a4a5]  bg-opacity-50 p-6 rounded-lg`}> {/* Added semi-transparent background */}
                <h1
                                     className="text-[35px] leading-[1.2] 800px:text-[60px] text-white font-[600] capitalize text-shadow-md" /* Added text shadow */
                                     style={{
                                         textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)", /* Enhanced text-shadow */
                                     }}
                >
                    Empowering Women, <br /> Unleashing Potential
                </h1>
                
                <p className="pt-5 text-[16px] font-[Poppins] font-[400] text-white"
                   style={{
                       textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)", /* Added text shadow for paragraph */
                   }}
                >
                    Tamkeen is dedicated to uplifting talented women across Pakistan,
                    providing them with a platform to showcase their skills and gain
                    financial independence. From crafts to culinary arts, we enable
                    women to turn their talents into sustainable livelihoods.
                </p>
                
            </div>
        </div>
    );
};

export default Hero;
