import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit, AiOutlineDownload, AiOutlineClose } from "react-icons/ai";
import { getAllProductsShop, deleteProduct, updateProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";

// Consistent color scheme
const colors = {
  primary: '#c8a4a5', // Soft pink
  secondary: '#e6d8d8', // Light baby brown
  tertiary: '#f5f0f0', // Off-white
  light: '#faf7f7', // Very light background
  white: '#ffffff', // Pure white
  dark: '#5a4336', // Dark brown for text
  warning: '#f59e0b', // Warning color
  danger: '#ef4444', // Error color
  success: '#10b981', // Success color
};

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [localProducts, setLocalProducts] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    originalPrice: '',
    discountPrice: '',
    stock: '',
    images: []
  });

  useEffect(() => {
    dispatch(getAllProductsShop(seller._id));
  }, [dispatch, seller._id]);

  useEffect(() => {
    if (products) {
      setLocalProducts([...products]);
    }
  }, [products]);

  const handleDelete = (id) => {
    setSelectedProduct(id);
    setConfirmDelete(true);
  };

  const confirmDeleteHandler = () => {
    dispatch(deleteProduct(selectedProduct))
      .then(() => {
        setLocalProducts(prevProducts => 
          prevProducts.filter(product => product._id !== selectedProduct)
        );
        setConfirmDelete(false);
        setSelectedProduct(null);
      });
  };

  const handleView = (product) => {
    setViewProduct(product);
    setViewModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      originalPrice: product.originalPrice || '', 
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      images: product.images || []
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    try {
      // Create FormData for the update
      const form = new FormData();
      
      // Only append non-empty values
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          // Handle arrays (like images) differently
          if (Array.isArray(formData[key])) {
            formData[key].forEach((item, index) => {
              form.append(`${key}[${index}]`, item);
            });
          } else {
            form.append(key, formData[key]);
          }
        }
      });

      // Use the correct product ID (_id, not id)
      await dispatch(updateProduct(selectedProduct._id, form));
      
      // Update local state with the new data
      setLocalProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === selectedProduct._id ? 
            {...product, ...formData} : product
        )
      );
      
      // Close modal and refresh data
      setEditModalOpen(false);
      setSelectedProduct(null);
      
      // Optionally refresh from server to ensure consistency
      dispatch(getAllProductsShop(seller._id));
      
    } catch (error) {
      console.error('Error updating product:', error);
      // Handle error - maybe show a toast notification
    }
  };

  return (
    <div className="w-full p-8 min-h-screen" style={{ backgroundColor: colors.light }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: colors.dark }}>
        All Products
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : localProducts && localProducts.length === 0 ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md text-center">
          <AiOutlineDownload size={40} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2 text-green-800">No Products Yet</h2>
          <p className="text-green-700">You haven't created any products yet. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold Out
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localProducts && localProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-amber-900">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-amber-900">
                      Rs {product.originalPrice}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-amber-900">
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-amber-900">
                      {product.sold_out || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                    <button
                      onClick={() => handleView(product)}
                      className="flex items-center px-3 py-1 rounded text-white transition-colors bg-[#c8a4a5] hover:bg-[#b59394]"
                    >
                      <AiOutlineEye className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center px-3 py-1 rounded text-white transition-colors bg-[#c8a4a5] hover:bg-[#b59394]"
                    >
                      <AiOutlineEdit className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center px-3 py-1 rounded text-white transition-colors bg-[#c8a4a5] hover:bg-[#b59394]"
                    >
                      <AiOutlineDelete className="mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Product Modal */}
      {viewModalOpen && viewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold" style={{ color: colors.dark }}>
                  Product Details
                </h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <AiOutlineClose size={24} style={{ color: colors.dark }} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Images */}
                <div>
                  <h3 className="text-lg font-medium mb-3" style={{ color: colors.dark }}>
                    Product Images
                  </h3>
                  {viewProduct.images && Array.isArray(viewProduct.images) && viewProduct.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {viewProduct.images.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            // Fallback when image fails to load
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            e.target.onerror = null; // Prevent infinite loop
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                      Product Name
                    </label>
                    <p className="text-lg font-semibold" style={{ color: colors.dark }}>
                      {viewProduct.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                      Description
                    </label>
                    <p className="text-gray-700 leading-relaxed">
                      {viewProduct.description || 'No description available'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                        Category
                      </label>
                      <p className="text-gray-700">{viewProduct.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                        Stock
                      </label>
                      <p className="text-gray-700">{viewProduct.stock}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                        Original Price
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        Rs {viewProduct.originalPrice}
                      </p>
                    </div>
                    {viewProduct.discountPrice && (
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                          Discount Price
                        </label>
                        <p className="text-lg font-semibold text-red-600">
                          Rs {viewProduct.discountPrice}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                        Sold
                      </label>
                      <p className="text-gray-700">{viewProduct.sold_out || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                        Product ID
                      </label>
                  <p className="text-gray-700 text-sm">
                        {viewProduct.universalId || viewProduct.universal_id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {viewProduct.tags && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.dark }}>
                        Tags
                      </label>
                      <span
                        className="px-3 py-1 text-sm rounded-full inline-block"
                        style={{ backgroundColor: colors.secondary, color: colors.dark }}
                      >
                        {viewProduct.tags}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-6 py-2 rounded text-white transition-colors"
                  style={{ backgroundColor: colors.primary }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.dark }}>
                Edit Product
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.dark }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.dark }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.dark }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.dark }}>
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium" style={{ color: colors.dark }}>
                      Discount Price
                    </label>
                    <input
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: colors.dark }}>
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 rounded text-white transition-colors"
                  style={{ backgroundColor: colors.danger }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded text-white transition-colors"
                  style={{ backgroundColor: colors.success }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.dark }}>
                Confirm Deletion
              </h2>
              <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded text-white transition-colors"
                  style={{ backgroundColor: colors.secondary, color: colors.dark }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteHandler}
                  className="px-4 py-2 rounded text-white transition-colors"
                  style={{ backgroundColor: colors.danger }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;