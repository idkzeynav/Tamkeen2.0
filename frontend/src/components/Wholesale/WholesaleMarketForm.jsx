import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createWholesaleMarket, updateWholesaleMarket, getAllWholesaleMarkets } from "../../redux/actions/wholesaleMarketActions";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';

const PREDEFINED_CATEGORIES = [
  'Clothing and Textiles',
  'Electronics',
  'Groceries and Food Items',
  'Household Items',
  'Jewelry and Accessories',
  'Miscellaneous'
];

const WholesaleMarketForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wholesaleMarkets, loading, error } = useSelector((state) => state.wholesaleMarket);

  const [supplierName, setSupplierName] = useState("");
  const [location, setLocation] = useState("");
  const [materialTypes, setMaterialTypes] = useState(['']); // Array for multiple material types
  const [contactInfo, setContactInfo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Validation error for contact info
  const [contactError, setContactError] = useState(""); // Added missing state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formError, setFormError] = useState("");

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });

       // Clear form error when user selects categories
       setFormError("");
      };

  // UseEffect moved out of the handleSubmit function
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const market = wholesaleMarkets.find((market) => market._id === id);
      if (market) {
        setSupplierName(market.supplierName);
        setLocation(market.location);
        setContactInfo(market.contactInfo?.slice(1) || ""); // Remove leading 0 if present
        setSelectedCategories(Array.isArray(market.materialType) ? market.materialType : [market.materialType]);
      }
    }
  }, [id, wholesaleMarkets]);


  const validateContactInfo = (value = contactInfo) => {
    if (!value) return true; // Allow empty since it's optional
    
    const cleanNumber = value.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) {
      setContactError('Phone number must be exactly 10 digits');
      return false;
    }
    
    const prefix = cleanNumber.substring(0, 2);
    const validPrefixes = ['30', '31', '32', '33', '34', '35'];
    if (!validPrefixes.includes(prefix)) {
      setContactError('Must start with 30-35');
      return false;
    }

    setContactError('');
    return true;
  };

  const handleContactChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    setContactInfo(value);
    
    if (value.length === 10) {
      validateContactInfo(value);
    } else if (value.length < 10) {
      setContactError('');
    }
  };

  const handlePlaceSearch = async () => {
    if (!supplierName) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pk&q=${encodeURIComponent(
          supplierName
        )}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const locations = data.map(
          (place) => `${place.display_name} (Lat: ${place.lat}, Lon: ${place.lon})`
        );
        setLocation(locations.join(" | "));
      } else {
        setLocation("No location found.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation("Error fetching location.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate categories
    if (selectedCategories.length === 0) {
      setFormError("Please select at least one category");
      return;
    }
  
    if (contactInfo && !validateContactInfo(contactInfo)) {
      return;
    }
    


    const data = {
      supplierName,
      materialType: selectedCategories,
      location,
      ...(contactInfo && { contactInfo: `0${contactInfo}` }),
    };

    try {
      if (isEditing) {
        await dispatch(updateWholesaleMarket(id, data));
      } else {
        await dispatch(createWholesaleMarket(data));
      }
      alert(isEditing ? "Market updated successfully!" : "Market created successfully!");
      navigate("/admin-wholesale-markets");
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.data?.message) {
        setContactError(error.response.data.message);
      } else {
        setContactError("An error occurred while saving the market");
      }
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e6d8d8]">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-[#5a4336] mb-6 text-center">
          {isEditing ? "Update Wholesale Market" : "Create Wholesale Market"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
<div className="flex flex-col">
  <label htmlFor="supplierName" className="text-[#5a4336] text-lg">
    Wholesale Market Name
  </label>
  <input
    type="text"
    id="supplierName"
    value={supplierName}
    onChange={(e) => setSupplierName(e.target.value)}
    onBlur={handlePlaceSearch}
    className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
    required
  />
</div>

<div className="flex flex-col">
  <label htmlFor="location" className="text-[#5a4336] text-lg">
    Location
  </label>
  <textarea
    id="location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
    required
  />
</div>

<div className="grid grid-cols-2 gap-4">
    {PREDEFINED_CATEGORIES.map((category) => (
        <div key={category} className="flex items-center">
            <input
                type="checkbox"
                id={category}
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 text-[#c8a4a5] border-[#c8a4a5] rounded focus:ring-[#c8a4a5] focus:ring-offset-0"
                style={{
                    '--tw-ring-color': '#c8a4a5',
                    'accentColor': '#c8a4a5'
                }}
            />
            <label htmlFor={category} className="ml-2 text-[#5a4336]">
                {category}
            </label>
        </div>
    ))}
</div>

<div className="flex flex-col">
  <label htmlFor="contactInfo" className="text-[#5a4336] text-lg">
    Contact Information 
  </label>
  <div className="flex items-center gap-2">
    <span className="text-gray-500">+92</span>
    <input
       type="text"
       value={contactInfo}
       onChange={handleContactChange}
       placeholder="3xxxxxxxxx"
      className="flex-1 p-3 mt-2 rounded-lg border border-[#c8a4a5] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] transition-all"
      maxLength="10"
    />
  </div>
  {contactError && <p className="text-red-500 text-sm mt-2">{contactError}</p>}
</div>

<button
  type="submit"
  className="bg-[#c8a4a5] text-white py-3 px-8 rounded-full transition-all duration-300 hover:bg-[#8c6c6b] transform hover:scale-105"
>
  {isEditing ? "Update Market" : "Create Market"}
</button>
</form>
      </div>
    </div>
  );
};

export default WholesaleMarketForm;

