// AdminSuppliers.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { Link, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/Layout/AdminHeader";
import AdminSideBar from "../../components/Admin/Layout/AdminSideBar";
import { 
  AiOutlineDelete, 
  AiOutlineEdit, 
  AiOutlinePlus, 
  AiOutlineEye,
  AiOutlineFilter,
  AiOutlineDownload
} from "react-icons/ai";
import { 
  MdVerified, 
  MdEmail, 
  MdCheckCircle, 
  MdError, 
  MdStar,
  MdStarBorder
} from "react-icons/md";
import Loader from "../Layout/Loader";
import { getAllSuppliers, deleteSupplier } from "../../redux/actions/supplier";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";

const AdminSuppliers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { suppliers, isLoading } = useSelector((state) => state.supplier);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Email tracking states
  const [showEmailTracking, setShowEmailTracking] = useState(false);
  const [emailTrackings, setEmailTrackings] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState("");
  const [emailStats, setEmailStats] = useState({});
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  
  // Email filters
  const [emailFilters, setEmailFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    dispatch(getAllSuppliers({ page, limit: pageSize, search: searchTerm }));
  }, [dispatch, page, pageSize, searchTerm]);

  // Fetch email tracking data for specific supplier
  const fetchSupplierEmailTracking = async (supplierId, supplierName) => {
    try {
      setIsLoadingEmails(true);
      setSelectedSupplierId(supplierId);
      setSelectedSupplierName(supplierName);
      
      const queryParams = new URLSearchParams({
        supplierId,
        ...Object.fromEntries(Object.entries(emailFilters).filter(([_, v]) => v && v !== 'all'))
      });

      const response = await axios.get(
        `${server}/admin/email-tracking/get-all-email-tracking?${queryParams}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setEmailTrackings(response.data.emailTrackings);
        setShowEmailTracking(true);
        
        // Calculate stats for this supplier
        const stats = {
          totalEmails: response.data.emailTrackings.length,
          deliveredEmails: response.data.emailTrackings.filter(e => e.emailStatus === 'delivered').length,
          failedEmails: response.data.emailTrackings.filter(e => ['failed', 'bounced'].includes(e.emailStatus)).length,
          emailsWithRatings: response.data.emailTrackings.filter(e => e.hasRated).length
        };
        setEmailStats(stats);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch email tracking data");
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Close email tracking modal
  const closeEmailTracking = () => {
    setShowEmailTracking(false);
    setSelectedSupplierId(null);
    setSelectedSupplierName("");
    setEmailTrackings([]);
    setEmailStats({});
  };

  // Export supplier email data
  const exportSupplierEmails = () => {
    if (emailTrackings.length === 0) {
      toast.info("No email data to export");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Buyer,Supplier,Email Subject,Status,Sent Date,Delivered Date,Has Rating\n"
      + emailTrackings.map(row => 
          `"${row.buyerId?.name || 'N/A'}","${row.supplierId?.name || 'N/A'}","${row.emailSubject}","${row.emailStatus}","${new Date(row.createdAt).toLocaleDateString()}","${row.deliveredAt ? new Date(row.deliveredAt).toLocaleDateString() : 'N/A'}","${row.hasRated ? 'Yes' : 'No'}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedSupplierName}_emails_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status icon renderer for emails
  const renderEmailStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <MdEmail className="text-blue-600" size={16} />;
      case 'delivered':
        return <MdCheckCircle className="text-green-600" size={16} />;
      case 'failed':
      case 'bounced':
        return <MdError className="text-red-600" size={16} />;
      default:
        return <MdEmail className="text-gray-400" size={16} />;
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 220 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { 
      field: "materials", 
      headerName: "Materials", 
      width: 300,
      renderCell: (params) => (
        <div className="flex flex-wrap gap-1">
          {params.row.materials.slice(0, 3).map((m, i) => (
            <span key={i} className="bg-[#f7f1f1] px-2 py-1 rounded text-xs">
              {m.category}
            </span>
          ))}
          {params.row.materials.length > 3 && (
            <span className="text-xs text-gray-500">+{params.row.materials.length - 3} more</span>
          )}
        </div>
      )
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 130,
      renderCell: (params) => (
        <span className={`capitalize ${params.value === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
          {params.value}
        </span>
      )
    },
 
    
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/admin/suppliers/edit/${params.id}`)}
            className="text-[#c8a4a5] hover:text-[#8c6c6b]"
            title="Edit Supplier"
          >
            <AiOutlineEdit size={20} />
          </button>
          <button 
            onClick={() => dispatch(deleteSupplier(params.id))}
            className="text-red-400 hover:text-red-600"
            title="Delete Supplier"
          >
            <AiOutlineDelete size={20} />
          </button>
        </div>
      ),
    },
  ];

  const rows = suppliers.map((supplier) => ({
    id: supplier._id,
    name: supplier.name,
    email: supplier.email,
    materials: supplier.materials,
    status: supplier.status,
    isVerified: supplier.isVerified,
  }));

  // Email tracking columns
  const emailColumns = [
    { 
      field: "buyer", 
      headerName: "Buyer", 
      width: 200,
      renderCell: (params) => (
        <div>
          <div className="font-medium text-sm">{params.row.buyerName}</div>
          <div className="text-xs text-gray-500">{params.row.buyerEmail}</div>
        </div>
      )
    },
    { 
      field: "subject", 
      headerName: "Subject", 
      width: 250,
      renderCell: (params) => (
        <div className="truncate" title={params.value}>
          {params.value}
        </div>
      )
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {renderEmailStatusIcon(params.value)}
          <span className="capitalize text-sm">{params.value}</span>
        </div>
      )
    },
    { 
      field: "sentDate", 
      headerName: "Sent Date", 
      width: 150,
      renderCell: (params) => (
        <div>
          <div className="text-sm">{params.row.sentDate}</div>
          <div className="text-xs text-gray-500">{params.row.sentTime}</div>
        </div>
      )
    },
    { 
      field: "hasRated", 
      headerName: "Rating", 
      width: 80,
      renderCell: (params) => (
        params.value ? 
        <MdStar className="text-yellow-500" size={16} /> : 
        <MdStarBorder className="text-gray-400" size={16} />
      ) 
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Link 
          to={`/admin/email-tracking/view/${params.id}`}
          className="text-[#c8a4a5] hover:text-[#8c6c6b]"
          title="View Details"
        >
          <AiOutlineEye size={16} />
        </Link>
      ),
    },
  ];

  const emailRows = emailTrackings.map((tracking) => {
    const sentDate = new Date(tracking.createdAt);
    
    return {
      id: tracking._id,
      buyerName: tracking.buyerId?.name || 'N/A',
      buyerEmail: tracking.buyerId?.email || 'N/A',
      subject: tracking.emailSubject,
      status: tracking.emailStatus,
      sentDate: sentDate.toLocaleDateString(),
      sentTime: sentDate.toLocaleTimeString(),
      hasRated: tracking.hasRated,
    };
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex">
        <AdminSideBar />
        {/* Main Content Area - Fixed positioning to avoid overlap */}
        <div className="flex-1 ml-64 mt-16 p-8 bg-[#f7f1f1] min-h-screen">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-[#5a4336]">Manage Suppliers</h3>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-3 border border-[#d8c4b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                />
                <Link
                  to="/admin/suppliers/create"
                  className="bg-[#c8a4a5] text-white px-6 py-3 rounded-lg hover:bg-[#8c6c6b] transition-colors flex items-center gap-2"
                >
                  <AiOutlinePlus />
                  Add Supplier
                </Link>
              </div>
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={pageSize}
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  rowsPerPageOptions={[10, 20, 50]}
                  pagination
                  autoHeight
                  disableSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-cell': {
                      borderColor: '#d8c4b8'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f7f1f1',
                      borderBottom: '2px solid #d8c4b8'
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f7f1f1'
                    }
                  }}
                />
              </div>
            )}

            {/* Email Tracking Modal */}
            {showEmailTracking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-[#f7f1f1] p-6 border-b border-[#d8c4b8]">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-2xl font-bold text-[#5a4336]">
                          Email Activity - {selectedSupplierName}
                        </h4>
                        <p className="text-gray-600 mt-1">
                          View all email communications with this supplier
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={exportSupplierEmails}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <AiOutlineDownload />
                          Export
                        </button>
                        <button
                          onClick={closeEmailTracking}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Statistics */}
                  <div className="p-6 border-b border-[#d8c4b8]">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-xs font-medium">Total Emails</p>
                            <p className="text-xl font-bold text-blue-700">{emailStats.totalEmails || 0}</p>
                          </div>
                          <MdEmail className="text-blue-600" size={24} />
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-xs font-medium">Delivered</p>
                            <p className="text-xl font-bold text-green-700">{emailStats.deliveredEmails || 0}</p>
                          </div>
                          <MdCheckCircle className="text-green-600" size={24} />
                        </div>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-600 text-xs font-medium">Failed</p>
                            <p className="text-xl font-bold text-red-700">{emailStats.failedEmails || 0}</p>
                          </div>
                          <MdError className="text-red-600" size={24} />
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-600 text-xs font-medium">With Ratings</p>
                            <p className="text-xl font-bold text-yellow-700">{emailStats.emailsWithRatings || 0}</p>
                          </div>
                          <MdStar className="text-yellow-600" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Filters */}
                  <div className="p-6 border-b border-[#d8c4b8] bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={emailFilters.status}
                          onChange={(e) => setEmailFilters({...emailFilters, status: e.target.value})}
                          className="w-full p-2 border border-[#d8c4b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                        >
                          <option value="all">All Status</option>
                          <option value="sent">Sent</option>
                          <option value="delivered">Delivered</option>
                          <option value="failed">Failed</option>
                          <option value="bounced">Bounced</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                        <input
                          type="date"
                          value={emailFilters.dateFrom}
                          onChange={(e) => setEmailFilters({...emailFilters, dateFrom: e.target.value})}
                          className="w-full p-2 border border-[#d8c4b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input
                          type="date"
                          value={emailFilters.dateTo}
                          onChange={(e) => setEmailFilters({...emailFilters, dateTo: e.target.value})}
                          className="w-full p-2 border border-[#d8c4b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setEmailFilters({status: 'all', dateFrom: '', dateTo: ''})}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Clear Filters
                      </button>
                      
                      <button
                        onClick={() => fetchSupplierEmailTracking(selectedSupplierId, selectedSupplierName)}
                        className="bg-[#c8a4a5] text-white px-4 py-2 rounded-lg hover:bg-[#8c6c6b] transition-colors flex items-center gap-2"
                      >
                        <AiOutlineFilter />
                        Apply Filters
                      </button>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="p-6 max-h-96 overflow-y-auto">
                    {isLoadingEmails ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8a4a5]"></div>
                      </div>
                    ) : emailTrackings.length > 0 ? (
                      <DataGrid
                        rows={emailRows}
                        columns={emailColumns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        autoHeight
                        disableSelectionOnClick
                        hideFooter={emailRows.length <= 10}
                        sx={{
                          '& .MuiDataGrid-cell': {
                            borderColor: '#d8c4b8'
                          },
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f7f1f1',
                            borderBottom: '2px solid #d8c4b8'
                          },
                          '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f7f1f1'
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <MdEmail className="mx-auto text-gray-300 mb-4" size={48} />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No Email Activity</h4>
                        <p className="text-gray-500">No emails found for this supplier with the current filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuppliers;