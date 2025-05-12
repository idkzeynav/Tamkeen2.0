import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/actions/product";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";

const CreateProduct = () => {
    const { seller } = useSelector((state) => state.seller);
    const { success, error } = useSelector((state) => state.products);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [images, setImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [originalPrice, setOriginalPrice] = useState();
    const [discountPrice, setDiscountPrice] = useState();
    const [stock, setStock] = useState();

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (success) {
            toast.success("Product created successfully!");
            navigate("/dashboard");
            window.location.reload();
        }
    }, [dispatch, error, success]);

    const handleImageChange = (e) => {
        e.preventDefault();
        let files = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...files]);
        setMainImage(URL.createObjectURL(files[0])); 
         // Set the first image as main image

    };
    console.log(images);
  
    const handleThumbnailClick = (image) => {
        setMainImage(URL.createObjectURL(image)); // Set the clicked thumbnail as main image
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newForm = new FormData();

        images.forEach((image) => {
            newForm.append("images", image);
        });
        newForm.append("name", name);
        newForm.append("description", description);
        newForm.append("category", category);
        newForm.append("tags", tags);
        newForm.append("originalPrice", originalPrice);
        newForm.append("discountPrice", discountPrice || 0); 
        newForm.append("stock", stock);
        newForm.append("shopId", seller._id);
        dispatch(createProduct(newForm));
    };

    return (

                <div className="w-full bg-white grid grid-cols-2 bg-[#5a4336] shadow h-[89vh]  p-0 m-0  ">
       
            {/* Left Side - Heading and Image */}
          <div className="flex flex-col items-center justify-center bg-[#c8a4a5] p-20">
                <h5 className="text-[30px] text-white font-Poppins mb-4">Add New Product</h5>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt="Product"
                        className="max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                ) : (
                    <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                        <AiOutlinePlusCircle size={100} color="white mt-2" />
                        <span className="text-white mt-2">Upload Product Image</span>
                    </label>
                )}
                <input
                    type="file"
                    id="upload"
                    className="hidden"
                    multiple
                    onChange={handleImageChange}
                />
                {images.length > 0 && (
                    <div className="flex mt-4">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(image)}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-[80px] w-[80px] object-cover m-2 cursor-pointer border-2 border-transparent hover:border-[#5a4336]"
                                onClick={() => handleThumbnailClick(image)}
                            />
                        ))}
                        <label htmlFor="upload" className="cursor-pointer flex items-center justify-center h-[80px] w-[80px] border-2 border-dashed border-[#5a4336] m-2">
                            <AiOutlinePlusCircle size={30} color="#5a4336" />
                        </label>
                    </div>
                )}
            </div>

            {/* Right Side - Form Fields */}
            <div className="flex flex-col justify-center p-9 bg-white shadow-lg">
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
                    <div className="mb-4">
                        <label className="block pb-2 text-[#5a4336]">Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            className="w-full p-2 border border-[#a67d6d] rounded-lg focus:outline-none focus:border-[#5a4336] focus:ring-1 focus:ring-[#a67d6d] hover:border-[#c8a4a5]"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter product name..."
                        />
                    </div>

                    <div className="mb-4 col-span-2">
                        <label className="block pb-2 text-[#5a4336]">Description <span className="text-red-500">*</span></label>
                        <textarea
                            name="description"
                            value={description}
                            className="w-full p-3 border border-[#a67d6d] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a67d6d] focus:border-[#5a4336] hover:border-[#c8a4a5]"
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter product description..."
                            rows="1"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block pb-2 text-[#5a4336]">Category <span className="text-red-500">*</span></label>
                        <select
                            className="w-full p-2 border border-[#a67d6d] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a67d6d] focus:border-[#5a4336] hover:border-[#d8c4b8]"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Choose a category</option>
                            {categoriesData.map((i) => (
                                <option value={i.title} key={i.title}>
                                    {i.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block pb-2 text-[#5a4336]">Tags</label>
                        <input
                            type="text"
                            name="tags"
                            value={tags}
                            className="w-full p-2 border border-[#a67d6d] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a67d6d] focus:border-[#5a4336] hover:border-[#d8c4b8]"
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Enter product tags..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block pb-2 text-[#5a4336]">Original Price <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="price"
                            value={originalPrice}
                            className="w-full p-2 border border-[#a67d6d] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a67d6d] focus:border-[#5a4336] hover:border-[#d8c4b8]"
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            placeholder="Enter product price..."
                        />
                         <p className="text-sm text-[#5a4336] mt-1">
        <strong>Note:</strong> Please include the shipping cost in the product price. 
    </p>
                    </div>

                    <div className="mb-4">
                        <label className="block pb-2 text-[#5a4336]">Price (With Discount) </label>
                        <input
                            type="number"
                            name="price"
                            value={discountPrice}
                            className="w-full p-2 border border-[#a67d6d] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a67d6d] focus:border-[#5a4336] hover:border-[#d8c4b8]"
                            onChange={(e) => setDiscountPrice(e.target.value)}
                            placeholder="Enter discount price..."
                        />
                    </div>

                    <div className="mb-4 col-span-2">
                        <label className="block pb-2 text-[#5a4336]">Product Stock <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="stock"
                            value={stock}
                            className="w-full p-2 border border-[#a67d6d] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#a67d6d] focus:border-[#5a4336] hover:border-[#d8c4b8]"
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="Enter product stock..."
                        />
                    </div>

                    <div className="col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-[#c8a4a5] text-white p-3 rounded-lg hover:bg-[#5a4336] transition-all"
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>   
    );
};

export default CreateProduct;
