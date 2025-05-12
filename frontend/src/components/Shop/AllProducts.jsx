import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop, deleteProduct, updateProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [localProducts, setLocalProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    originalPrice: '',
    discountPrice: '',
    stock: '',
    images: []
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    dispatch(getAllProductsShop(seller._id));
  }, [dispatch, seller._id]);

  // Update local products state when products from Redux change
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
        // Update local state by filtering out the deleted product
        setLocalProducts(prevProducts => 
          prevProducts.filter(product => product._id !== selectedProduct)
        );
        
        setSnackbarMessage('Product deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setConfirmDelete(false);
        setSelectedProduct(null);
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        setSnackbarMessage('Failed to delete product');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
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
    setOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedProduct) {
      console.error("No product selected for update.");
      return;
    }

    const form = new FormData();

    // Append form data
    Object.keys(formData).forEach((key) => {
      if (key === "originalPrice" || key === "discountPrice" || key === "stock") {
        const value = formData[key];
        if (value !== '') {
          const numberValue = Number(value);
          if (!isNaN(numberValue)) {
            form.append(key, numberValue);
          } else {
            console.error(`Invalid value for ${key}: ${value}`);
          }
        }
      } else {
        if (formData[key] !== '') {
          form.append(key, formData[key]);
        }
      }
    });

    // Append images if new ones are selected
    if (formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        form.append('images', formData.images[i]);
      }
    }

    dispatch(updateProduct(selectedProduct.id, form))
      .then(() => {
        // Update the local state with the updated product
        const updatedProduct = {
          ...selectedProduct,
          name: formData.name,
          originalPrice: formData.originalPrice,
          stock: formData.stock,
        };

        setLocalProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === selectedProduct.id ? 
              {...product, ...updatedProduct} : product
          )
        );

        setSnackbarMessage('Product updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setOpen(false);
        
        // Refresh product list from server without page reload
        dispatch(getAllProductsShop(seller._id));
      })
      .catch((error) => {
        console.error("Error updating product: ", error.response ? error.response.data : error.message);
        setSnackbarMessage('Failed to update product');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 180,
      flex: 1.4,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: "stock",
      headerName: "Stock", 
      type: "number",
      minWidth: 100, 
      flex: 0.6,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: "sold",
      headerName: "Sold Out", 
      type: "number",
      minWidth: 130,
      flex: 0.6,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: "Preview",
      headerName: "Preview",
      flex: 0.6,
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        return (
          <Link to={`/product/${params.id}`}>
            <Button>
              <AiOutlineEye size={20} style={{ color: '#c8a4a5' }} />
            </Button>
          </Link>
        );
      },
    },
    {
      field: "Edit",
      headerName: "Edit",
      flex: 0.8,
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        return (
          <Button onClick={() => handleEdit(params.row)}>
            <AiOutlineEdit size={20} style={{ color: '#c8a4a5' }} />
          </Button>
        );
      },
    },
    {
      field: "Delete",
      headerName: "Delete",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Button onClick={() => handleDelete(params.id)}>
            <AiOutlineDelete size={20} style={{ color: '#c8a4a5' }} />
          </Button>
        );
      },
    },
  ];

  const rows = [];

  localProducts &&
    localProducts.forEach((item) => {
      rows.push({
        id: item._id,
        name: item.name,
        price: "Rs " + item.originalPrice,
        stock: item.stock,
        sold: item.sold_out,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-gray-100 flex justify-center items-start py-10">
          <div className="w-full max-w-6xl bg-[#c8a4a5] backdrop-blur-md rounded-2xl shadow-2xl p-10 transform hover:scale-105 transition-transform duration-500">
            <h1 className="text-2xl font-semibold text-[#5a4336] mb-8 text-center">
              All Products
            </h1>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
              className="text-[#5a4336] font-semibold bg-white rounded-lg border-none shadow-xl"
              headerHeight={40}
              rowHeight={40}
            />
            
            {/* Edit Product Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle className="text-center text-[#5a4336] bg-gray-100">Edit Product</DialogTitle>
              <DialogContent>
                <Paper style={{ padding: '16px', backgroundColor: '#c8a4a5', borderColor: '#c8a4a5', borderRadius: '8px' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                              borderColor: '#5a4336',
                            },
                            '&:hover fieldset': {
                              borderColor: '#c8a4a5',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#5a4336',
                            },
                          },
                          '& label': {
                            color: '#5a4336',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#5a4336',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                              borderColor: '#5a4336',
                            },
                            '&:hover fieldset': {
                              borderColor: '#c8a4a5',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#5a4336',
                            },
                          },
                          '& label': {
                            color: '#5a4336',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#5a4336',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                              borderColor: '#5a4336',
                            },
                            '&:hover fieldset': {
                              borderColor: '#c8a4a5',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#5a4336',
                            },
                          },
                          '& label': {
                            color: '#5a4336',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#5a4336',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Original Price"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                              borderColor: '#5a4336',
                            },
                            '&:hover fieldset': {
                              borderColor: '#c8a4a5',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#5a4336',
                            },
                          },
                          '& label': {
                            color: '#5a4336',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#5a4336',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Discount Price"
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                              borderColor: '#5a4336',
                            },
                            '&:hover fieldset': {
                              borderColor: '#c8a4a5',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#5a4336',
                            },
                          },
                          '& label': {
                            color: '#5a4336',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#5a4336',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                              borderColor: '#5a4336',
                            },
                            '&:hover fieldset': {
                              borderColor: '#c8a4a5',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#5a4336',
                            },
                          },
                          '& label': {
                            color: '#5a4336',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#5a4336',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setOpen(false)} 
                  sx={{ backgroundColor: '#5a4336', color: 'white', '&:hover': { backgroundColor: '#5a4336' } }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdate} 
                  sx={{ backgroundColor: '#5a4336', color: 'white', '&:hover': { backgroundColor: '#5a4336' } }}
                >
                  Update
                </Button>
              </DialogActions>
            </Dialog>

            {/* Confirmation Dialog for Deletion */}
            <Dialog
              open={confirmDelete}
              onClose={() => setConfirmDelete(false)}
            >
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this product?</Typography>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setConfirmDelete(false)} 
                  sx={{ color: '#5a4336' }}
                >
                  No
                </Button>
                <Button 
                  onClick={confirmDeleteHandler} 
                  sx={{ color: '#5a4336' }}
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar for success messages */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </div>
        </div>
      )}
    </>
  );
};

export default AllProducts;