import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllWholesaleMarkets,
  deleteWholesaleMarket,
  createWholesaleMarket,
} from '../redux/actions/wholesaleMarketActions';
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Loader from '../components/Layout/Loader';
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/Layout/AdminHeader"; // Import AdminHeader
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx"; // Import AdminSideBar
import '../App.css'
import { MapPin, Phone } from 'lucide-react';

const AdminWholesaleMarketsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wholesaleMarkets, isLoading } = useSelector((state) => state.wholesaleMarket);

  const [supplierName, setSupplierName] = useState('');
  const [materialTypes, setMaterialTypes] = useState(['']); // Array to store multiple material types
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    dispatch(getAllWholesaleMarkets());
  }, [dispatch]);

 // Update this validation function
// Update validation function
const validateContactInfo = (value) => {
  if (!value) return true; // Allow empty since it's optional
  
  // Remove any non-digit characters
  const cleanNumber = value.replace(/\D/g, '');
  
  // Must be exactly 10 digits
  if (cleanNumber.length !== 10) {
    setContactError('Phone number must be exactly 10 digits');
    return false;
  }
  
  // Check if it starts with valid Pakistani mobile codes
  const prefix = cleanNumber.substring(0, 2);
  const validPrefixes = ['30', '31', '32', '33', '34', '35'];
  if (!validPrefixes.includes(prefix)) {
    setContactError('Must start with 30-35');
    return false;
  }

  setContactError('');
  return true;
};

// Update contact change handler
const handleContactChange = (e) => {
  let value = e.target.value;
  
  // Remove any non-digit characters
  value = value.replace(/\D/g, '');

  // Always allow setting the value
  setContactInfo(value);
  
  // Only show validation errors if we have a complete number
  if (value.length === 10) {
    validateContactInfo(value);
  } else if (value.length < 10) {
    setContactError(''); // Clear error while typing
  }
};

const addMaterialType = () => {
  setMaterialTypes([...materialTypes, '']);
};

const removeMaterialType = (index) => {
  if (materialTypes.length > 1) {
    const updatedTypes = [...materialTypes];
    updatedTypes.splice(index, 1);
    setMaterialTypes(updatedTypes);
  }
};

const handleMaterialTypeChange = (index, value) => {
  const updatedTypes = [...materialTypes];
  updatedTypes[index] = value;
  setMaterialTypes(updatedTypes);
};
  
  const handleDelete = (marketId) => {
    if (window.confirm('Are you sure you want to delete this market?')) {
      dispatch(deleteWholesaleMarket(marketId));
    } 
    window.location.reload(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Only validate if contact info is provided (since it's optional)
    if (contactInfo && !validateContactInfo(contactInfo)) {
      return;
    }

    // Filter out empty material types
    const filteredMaterialTypes = materialTypes.filter(type => type.trim() !== '');

    if (filteredMaterialTypes.length === 0) {
      alert('Please add at least one material type');
      return;
    }

    const newMarket = {
      supplierName,
      materialType: filteredMaterialTypes,
      location,
      // Only include contactInfo if it exists and is valid
      ...(contactInfo && { contactInfo: `0${contactInfo}` }), // Add 0 prefix before sending to server
    };

    try {
      await dispatch(createWholesaleMarket(newMarket));
      dispatch(getAllWholesaleMarkets());

      // Clear form
      setSupplierName('');
      setMaterialTypes(['']);
      setLocation('');
      setContactInfo('');
      setShowForm(false);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error creating wholesale market:', error);
      if (error.response?.data?.message) {
        setContactError(error.response.data.message);
      } else {
        alert('An error occurred while creating the wholesale market.');
      }
    }
};

  return (
    <div className="bg-[#f7f1f1] min-h-screen">
      <AdminHeader /> {/* Include AdminHeader */}
      <div className="w-full flex">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={6} /> {/* Set appropriate active menu */}
        </div>
        <div className="w-full p-4">      <h3 className="text-[22px] font-Poppins pb-2">Wholesale Markets</h3>
        <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/admin-wholesale-markets/create")}
              className="bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create New Wholesale Market
            </button>
          </div>

      {showSuccessPopup && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg">
          Wholesale Market created successfully!
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <>
         <div className="space-y-4">
    {wholesaleMarkets.map((market) => (
        <div
            key={market._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
            <div className="p-6">
                <div className="border-b border-[#e6d8d8] pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-[#5a4336] mb-2">{market.supplierName}</h3>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(market.materialType) ? 
                            market.materialType.map((type, idx) => (
                                <span key={idx} className="bg-[#f7f1f1] px-3 py-1 rounded-full text-sm text-[#5a4336]">
                                    {type}
                                </span>
                            )) : 
                            <span className="bg-[#f7f1f1] px-3 py-1 rounded-full text-sm text-[#5a4336]">
                                {market.materialType}
                            </span>
                        }
                    </div>
                </div>
              
                <div className="text-[#5a4336] mb-4">
    <p className="mb-2 flex items-center gap-2">
        <MapPin size={18} className="text-[#c8a4a5] flex-shrink-0" />
        <span>
            <span className="font-medium">Location:</span>{" "}
            {market.location.replace(/,?\s?\d+(\.\d+)?/g, "").trim()}
        </span>
    </p>
    {market.contactInfo && (
        <p className="flex items-center gap-2">
            <Phone size={18} className="text-[#c8a4a5] flex-shrink-0" />
            <span>
                <span className="font-medium">Contact:</span> {market.contactInfo}
            </span>
        </p>
    )}
</div>




                <div className="flex justify-end space-x-4">
                    <Link 
                        to={`/admin-wholesale-markets/update/${market._id}`}
                        className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors"
                    >
                        <AiOutlineEdit size={24} />
                    </Link>
                    <button
                        onClick={() => handleDelete(market._id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <AiOutlineDelete size={24} />
                    </button>
                </div>
            </div>
        </div>
    ))}
</div>



        </>
      )}
      {showForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">Create Wholesale Market</h2>
      
      <form onSubmit={handleCreateSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Supplier Name</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Material Types</label>
          {materialTypes.map((type, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={type}
                onChange={(e) => handleMaterialTypeChange(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                required
              />
              <button
                type="button"
                onClick={() => removeMaterialType(index)}
                className="px-2 py-1 bg-red-500 text-white rounded"
                disabled={materialTypes.length === 1}
              >
                <AiOutlineMinusCircle />
              </button>
              {index === materialTypes.length - 1 && (
                <button
                  type="button"
                  onClick={addMaterialType}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  <AiOutlinePlusCircle />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Contact Number</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">+92</span>
            <input
              type="text"
              value={contactInfo}
              onChange={handleContactChange}
              placeholder="3xxxxxxxxx"
              maxLength="10"
              className="flex-1 p-2 border rounded"
              
            />
          </div>
          {contactError && (
            <p className="text-red-500 text-sm mt-1">{contactError}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#c8a4a5] text-white rounded"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
    </div>
    </div>

  );
};

export default AdminWholesaleMarketsPage;