import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineDelete, AiOutlineSearch } from "react-icons/ai";
import { Button, TextField, InputAdornment } from "@material-ui/core";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search input changes with immediate dispatch
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Dispatch immediately without any character minimum
    dispatch(getAllUsers(value));
  };

  // Initial load
  useEffect(() => {
    dispatch(getAllUsers(""));
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/user/delete-user/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      });

    dispatch(getAllUsers(searchTerm));
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      Admin: "bg-[#5a4336] text-white text-xs px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-shadow",
      User: "bg-[#c8a4a5] text-white text-xs px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-shadow",
      Seller: "bg-[#a67d6d] text-white text-xs px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-shadow",
    };
    return (
      <span
        className={`${roleStyles[role] || "bg-gray-300 text-black text-xs px-3 py-1 rounded-full"} float-right`}
      >
        {role}
      </span>
    );
  };

  const columns = [
    { field: "id", headerName: "User ID", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Name",
      minWidth: 130,
      flex: 0.7,
    },
    {
      field: "email",
      headerName: "Email",
      type: "text",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "role",
      headerName: "Role",
      type: "text",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => getRoleBadge(params.value),
    },
    {
      field: "joinedAt",
      headerName: "Joined At",
      type: "text",
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: " ",
      flex: 1,
      minWidth: 100,
      headerName: "Delete User",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <Button
            onClick={() => setUserId(params.id) || setOpen(true)}
            style={{
              color: "#c8a4a5",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#8c6c6b")}
            onMouseLeave={(e) => (e.target.style.color = "#c8a4a5")}
          >
            <AiOutlineDelete size={20} />
          </Button>
        );
      },
    },
  ];

  const rows =
    users && users.length > 0
      ? users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          joinedAt: new Date(user.createdAt).toLocaleDateString(),
        }))
      : [];

  return (
    <div className="w-full flex justify-center pt-10 bg-[#f7f1f1] min-h-screen">
      <div className="w-[95%] bg-[#ffffff] shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#5a4336]">
            All Users
          </h1>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AiOutlineSearch size={20} className="text-[#a67d6d]" />
                </InputAdornment>
              ),
              style: { borderRadius: '8px' }
            }}
            style={{
              width: '300px',
              backgroundColor: '#fff'
            }}
          />
        </div>
        <div className="w-full min-h-[45vh] bg-[#fff] rounded-lg border border-[#d8c4b8] p-4">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
            loading={isLoading}
            className="text-[#5a4336]"
            style={{
              border: "none",
              fontFamily: "Poppins, sans-serif",
            }}
          />
        </div>
        {open && (
          <div className="fixed top-0 left-0 w-full h-full bg-[#00000066] flex items-center justify-center z-50">
            <div className="w-[90%] md:w-[40%] bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-end">
                <RxCross1
                  size={24}
                  className="cursor-pointer text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors"
                  onClick={() => setOpen(false)}
                />
              </div>
              <h3 className="text-center text-[20px] font-medium text-[#5a4336] mt-2">
                Are you sure you want to delete this user?
              </h3>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="bg-[#c8a4a5] text-white px-6 py-2 rounded-lg hover:bg-[#8c6c6b] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleDelete(userId);
                  }}
                  className="bg-[#5a4336] text-white px-6 py-2 rounded-lg hover:bg-[#3e2e28] transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;