import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

// Reuse the girlyStyles from ProfileContent for consistency
const girlyStyles = {
    container: "flex justify-center  items-center min-h-screen bg-gray-100 p-10",
    card: "bg-[#e6d8d8] p-10 rounded-lg shadow-xl transition-shadow duration-300 border border-[#c8a4a5] w-full max-w-7xl h-auto",
    input: "bg-[gray-100] text-[#5a4336] border border-[#c8a4a5] focus:outline-none focus:border-[#a67d6d] p-4 rounded-lg mb-6 w-full duration-300 transition-transform transform hover:scale-105",
    button: "bg-[#5a4336] text-white hover:bg-[#a67d6d] transition-all duration-300 p-4 rounded-md text-center w-full cursor-pointer",
    imageWrapper: "relative flex justify-center items-center mb-6",  // Added margin-bottom for spacing
    profileImage: "w-[150px] h-[150px] rounded-full border-4 border-[#c8a4a5] shadow-lg",
    cameraIconWrapper: "absolute bottom-2 bg-[#c8a4a5] text-white rounded-full p-2 cursor-pointer hover:bg-[#FF4F80] transition-all", // Adjusted positioning
    formTitle: "text-2xl font-bold text-[#5a4336] mb-4",
    formWrapper: "w-full flex flex-col items-center justify-center",
};

const ShopSettings = () => {
    const { seller } = useSelector((state) => state.seller);
    const [avatar, setAvatar] = useState();
    const [name, setName] = useState(seller && seller.name);
    const [description, setDescription] = useState(seller && seller.description ? seller.description : "");
    const [address, setAddress] = useState(seller && seller.address);
    const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
    const [zipCode, setZipcode] = useState(seller && seller.zipCode);


    const dispatch = useDispatch();

    // Image updated
    const handleImage = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        setAvatar(file);

        const formData = new FormData();

        formData.append("image", e.target.files[0]);

        await axios.put(`${server}/shop/update-shop-avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        }).then((res) => {
            dispatch(loadSeller());
            toast.success("Avatar updated successfully!")
        }).catch((error) => {
            toast.error(error.response.data.message);
        })

    };

    const updateHandler = async (e) => {
        e.preventDefault();

        await axios.put(`${server}/shop/update-seller-info`, {
            name,
            address,
            zipCode,
            phoneNumber,
            description,
        }, { withCredentials: true }).then((res) => {
            toast.success("Shop info updated succesfully!");
            dispatch(loadSeller());
        }).catch((error) => {
            toast.error(error.response.data.message);
        })
    };



    return (
      //  <div className="w-full bg-white grid grid-cols-2 bg-[#d8c4b8] shadow h-[90vh]  p-0 m-0  ">
       
        <div className="w-full max-w-10xl flex flex-col items-center overflow-y-scroll ">
            <div className="flex w-full  max-w-100xl 800px:w-[100%] flex-col justify-center my-0">
            <div className={girlyStyles.container}>
                <div className={girlyStyles.card}>
                    {/* Avatar Section */}
                    <div className={girlyStyles.imageWrapper}>
                        <img
                            src={avatar ? URL.createObjectURL(avatar) : `${backend_url}/${seller.avatar}`}
                            alt="shop avatar"
                            className={girlyStyles.profileImage}
                        />
                        <div className={girlyStyles.cameraIconWrapper}>
                            <input
                                type="file"
                                id="image"
                                className="hidden"
                                onChange={handleImage}
                            />
                            <label htmlFor="image">
                                <AiOutlineCamera size={24} />
                            </label>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className={girlyStyles.formWrapper}>
                        <h2 className={girlyStyles.formTitle}>Update Your Shop Info</h2>
                        <form onSubmit={updateHandler}>
                            <div className="w-full pb-3">
                                <label className="block pb-2 text-[#5a4336]">Shop Name</label>
                                <input
                                    type="text"
                                    className="bg-[gray-100] text-[#5a4336] border border-[#c8a4a5] focus:outline-none focus:border-[#a67d6d] p-4 rounded-lg mb-6 w-[500px] duration-300 transition-transform transform hover:scale-105"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="w-full pb-3">
                                <label className="block pb-2 text-[#5a4336]">Shop Description</label>
                                <input
                                    type="text"
                                    className={girlyStyles.input}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="w-full pb-3">
                                <label className="block pb-2 text-[#5a4336]">Shop Address</label>
                                <input
                                    type="text"
                                    className={girlyStyles.input}
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div className="w-full pb-3">
                                <label className="block pb-2 text-[#5a4336]">Phone Number</label>
                                <input
                                    type="number"
                                    className={girlyStyles.input}
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="w-full pb-3">
                                <label className="block pb-2 text-[#5a4336]">Zip Code</label>
                                <input
                                    type="number"
                                    className={girlyStyles.input}
                                    required
                                    value={zipCode}
                                    onChange={(e) => setZipcode(e.target.value)}
                                />
                            </div>
                            <input
                                className={girlyStyles.button}
                                type="submit"
                                value="Update Shop"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default ShopSettings;