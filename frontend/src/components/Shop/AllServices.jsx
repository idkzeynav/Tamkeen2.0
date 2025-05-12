import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";  // useNavigate instead of useHistory
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid } from "@mui/material";
import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit, AiOutlineClockCircle, AiOutlineEnvironment, AiOutlinePhone } from "react-icons/ai";
import { getAllServicesShop, deleteService, updateService } from "../../redux/actions/service";
import Loader from "../Layout/Loader";

const AllServices = () => {
  const { services, isLoading } = useSelector((state) => state.services);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactInfo: '',
    availability: {},
  });

  useEffect(() => {
    dispatch(getAllServicesShop(seller._id));
  }, [dispatch, seller._id]);

  // Handle delete of service
  const handleDelete = (id) => {
    dispatch(deleteService(id))
      .then(() => {
        // Optionally show a success message or refresh the list
        dispatch(getAllServicesShop(seller._id));
      })
      .catch((error) => console.error("Error deleting service:", error));
  };

  // Open edit dialog and populate fields
  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      location: service.location || '',
      contactInfo: service.contactInfo || '',
      availability: service.availability || {},
    });
    setOpen(true);
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  // Update the service
  const handleUpdate = () => {
    if (!selectedService) return;

    dispatch(updateService(selectedService._id, formData))
      .then(() => {
        setOpen(false);
        dispatch(getAllServicesShop(seller._id));  // Refresh service list after update
      })
      .catch((error) => {
        console.error("Error updating service: ", error);
      });
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-8">
          <h2 className="text-4xl font-bold text-[#5a4336] mb-8 text-center">Your Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => (
              <div key={service._id} className="relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-[#e6d8d8] hover:to-[#c8a4a5]">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-semibold text-[#5a4336]">{service.name}</h3>
                    <div className="flex gap-2">
                      {/* View button */}
                      <Link to={`/serviceShop/${service._id}`}>
                        <button className="p-2 rounded-full bg-[#d8c4b8] hover:bg-[#c8a4a5] transition-colors duration-300">
                          <AiOutlineEye size={20} className="text-[#5a4336]" />
                        </button>
                      </Link>
                      {/* Edit button */}
                      <button 
                        onClick={() => handleEdit(service)}
                        className="p-2 rounded-full bg-[#d8c4b8] hover:bg-[#c8a4a5] transition-colors duration-300"
                      >
                        <AiOutlineEdit size={20} className="text-[#5a4336]" />
                      </button>
                      {/* Delete button */}
                      <button 
                        onClick={() => handleDelete(service._id)}
                        className="p-2 rounded-full bg-[#d8c4b8] hover:bg-[#c8a4a5] transition-colors duration-300"
                      >
                        <AiOutlineDelete size={20} className="text-[#5a4336]" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlineEnvironment className="mr-2" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlinePhone className="mr-2" />
                      <span>{service.contactInfo}</span>
                    </div>
                    <div className="flex items-center text-[#a67d6d]">
                      <AiOutlineClockCircle className="mr-2" />
                      <span>
                        {Object.entries(service.availability)
                          .filter(([, info]) => info.available)
                          .length} days available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* Edit Service Dialog */}
        <Dialog 
  open={open}  // Corrected from 'editDialogOpen'
  onClose={() => setOpen(false)}  // Corrected from 'setEditDialogOpen'
  maxWidth="md"
  fullWidth
  classes={{
    paper: 'rounded-xl bg-gradient-to-br from-[#d8c4b8] to-[#c8a4a5]'
  }}
>
  <DialogTitle>
    <h2 className="text-2xl font-bold text-[#5a4336]">Edit Service</h2>
  </DialogTitle>
  <DialogContent>
    <Grid container spacing={3} className="pt-4">
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Service Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          variant="outlined"
          className="bg-white/80 rounded-lg"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#a67d6d',
              },
              '&:hover fieldset': {
                borderColor: '#5a4336',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#5a4336',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a67d6d',
              '&.Mui-focused': {
                color: '#5a4336',
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          variant="outlined"
          className="bg-white/80 rounded-lg"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#a67d6d',
              },
              '&:hover fieldset': {
                borderColor: '#5a4336',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#5a4336',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a67d6d',
              '&.Mui-focused': {
                color: '#5a4336',
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          variant="outlined"
          className="bg-white/80 rounded-lg"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#a67d6d',
              },
              '&:hover fieldset': {
                borderColor: '#5a4336',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#5a4336',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a67d6d',
              '&.Mui-focused': {
                color: '#5a4336',
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Info"
          value={formData.contactInfo}
          onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
          variant="outlined"
          className="bg-white/80 rounded-lg"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#a67d6d',
              },
              '&:hover fieldset': {
                borderColor: '#5a4336',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#5a4336',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#a67d6d',
              '&.Mui-focused': {
                color: '#5a4336',
              },
            },
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <h3 className="text-xl font-semibold text-[#5a4336] mb-4">Weekly Hours</h3>
        <div className="space-y-4">
          {Object.entries(formData.availability).map(([day, info]) => (
            <div key={day} className="flex items-center gap-4 p-4 rounded-lg bg-white/80">
              <input
                type="checkbox"
                checked={info?.available}
                onChange={(e) => handleAvailabilityChange(day, "available", e.target.checked)}
                className="w-5 h-5 rounded border-[#a67d6d] checked:bg-[#5a4336] checked:border-[#5a4336] focus:ring-[#5a4336] text-[#5a4336]"
              />
              <span className="w-24 font-medium text-[#5a4336]">{day}</span>
              {info?.available && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={info?.startTime}
                    onChange={(e) => handleAvailabilityChange(day, "startTime", e.target.value)}
                    className="p-2 rounded border border-[#a67d6d] focus:outline-none focus:ring-2 focus:ring-[#5a4336] focus:border-[#5a4336] text-[#5a4336]"
                  />
                  <span className="text-[#5a4336]">to</span>
                  <input
                    type="time"
                    value={info?.endTime}
                    onChange={(e) => handleAvailabilityChange(day, "endTime", e.target.value)}
                    className="p-2 rounded border border-[#a67d6d] focus:outline-none focus:ring-2 focus:ring-[#5a4336] focus:border-[#5a4336] text-[#5a4336]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Grid>
    </Grid>
  </DialogContent>

  <DialogActions className="p-6 bg-gradient-to-r from-[#d8c4b8] to-[#c8a4a5]">
    <button
      onClick={() => setOpen(false)}  // Corrected to 'setOpen'
      className="px-6 py-2 rounded-lg bg-white/80 text-[#5a4336] hover:bg-white transition-colors duration-300"
    >
      Cancel
    </button>
    <button
      onClick={handleUpdate}
      className="px-6 py-2 rounded-lg bg-[#5a4336] text-white hover:bg-[#a67d6d] transition-colors duration-300 ml-4"
    >
      Update
    </button>
  </DialogActions>
</Dialog>


        </div>
      )}
    </>
  );
};

export default AllServices;