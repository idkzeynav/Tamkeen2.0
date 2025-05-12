import React from "react";
import {
    AiFillFacebook,
    AiFillInstagram,
    AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import {
    footercompanyLinks,
    footerProductLinks,
    footerSupportLinks,
} from "../../static/data";

const Footer = () => {
    return (
        <div className="bg-[#f5e9e2] text-[#4a4a4a]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-16 text-center md:text-left">
                <div className="flex flex-col items-center sm:items-start">
                    <img
                        src="/TamkeenLogo.jpeg"
                        style={{ height: "70px", width: "250px" }}
                        alt="Tamkeen Logo"
                    />
                   
                </div>

                <ul className="flex flex-col items-center sm:items-start">
                    <h1 className="text-lg font-serif font-semibold text-[#4a4a4a] mb-2">Company</h1>
                    {footerProductLinks.map((link, index) => (
                        <li key={index}>
                            <Link
                                className="text-[#4a4a4a] hover:text-[#d3a17e] duration-300 text-sm leading-6"
                                to={link.link}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <ul className="flex flex-col items-center sm:items-start">
                    <h1 className="text-lg font-serif font-semibold text-[#4a4a4a] mb-2">Shop</h1>
                    {footercompanyLinks.map((link, index) => (
                        <li key={index}>
                            <Link
                                className="text-[#4a4a4a] hover:text-[#d3a17e] duration-300 text-sm leading-6"
                                to={link.link}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            
                <ul className="flex flex-col items-center sm:items-start">
                    <h1 className="text-lg font-serif font-semibold text-[#4a4a4a] mb-2">Support</h1>
                    {footerSupportLinks.map((link, index) => (
                        <li key={index}>
                            <Link
                                className="text-[#4a4a4a] hover:text-[#d3a17e] duration-300 text-sm leading-6"
                                to={link.link}
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left px-8 py-4 bg-[#c8a4a5] text-[#4a4a4a] text-sm">
                <span>© 2024 Tamkeen. All rights reserved.</span>
                <span className="sm:mt-0 mt-2">Terms · Privacy Policy</span>
                <div className="flex space-x-4 mt-4 sm:mt-0">

                </div>
            </div>
        </div>
    );
};

export default Footer;
