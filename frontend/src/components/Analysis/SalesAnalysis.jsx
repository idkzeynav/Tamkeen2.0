import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import Loader from '../Layout/Loader';

const modalStyle = {
  zIndex: 1000,
};

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RegionAreaAnalysisDashboard = () => {
  // State management
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [areaData, setAreaData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shopLocations, setShopLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]);
  const [mapZoom, setMapZoom] = useState(5);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalLocation, setModalLocation] = useState(null);

  const COLORS = ['#5a4336', '#a67d6d', '#c8a4a5', '#d8c4b8', '#8B6B5D', '#9F8178', '#BFA39F', '#E0D1C9'];
  
  // Memoize filtered data
  const filteredData = useMemo(() => {
    let filtered = salesData;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (selectedRegion !== 'All') {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }
    return filtered;
  }, [salesData, selectedCategory, selectedRegion]);

  // Memoize geocoding function
  const geocodeArea = useCallback(async (areaName, regionName) => {
    try {
      const query = areaName 
        ? `${areaName}, ${regionName}, Pakistan`
        : `${regionName}, Pakistan`;
      
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'YourApp/1.0'
        }
      });

      if (response.data?.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name,
        };
      }
      
      const regionResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: `${regionName}, Pakistan`,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'YourApp/1.0'
        }
      });
      
      if (regionResponse.data?.length > 0) {
        return {
          lat: parseFloat(regionResponse.data[0].lat),
          lon: parseFloat(regionResponse.data[0].lon),
          displayName: `${areaName}, ${regionResponse.data[0].display_name}`,
        };
      }
      
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }, []);

  // Fetch main data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/v2/sales-analysis/category-region-analysis');
        const processedData = await processRawData(response.data.salesAnalysis);
        setSalesData(processedData);
        
        const uniqueCategories = [...new Set(processedData.map(item => item.category))];
        setCategories(['All', ...uniqueCategories]);
        
        const uniqueRegions = [...new Set(processedData.map(item => item.region))];
        setRegions(['All', ...uniqueRegions]);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load sales data. Using sample data instead.');
        const sampleData = generateSampleData();
        setSalesData(sampleData);
        
        const uniqueCategories = [...new Set(sampleData.map(item => item.category))];
        setCategories(['All', ...uniqueCategories]);
        
        const uniqueRegions = [...new Set(sampleData.map(item => item.region))];
        setRegions(['All', ...uniqueRegions]);
        
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Optimized shop locations fetch
  useEffect(() => {
    const controller = new AbortController();
    const fetchShopLocations = async () => {
      try {
        // Clear previous locations when filters change
        setShopLocations([]);
  
        // Proper parameter handling
        const params = {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          region: selectedRegion !== 'All' ? selectedRegion : undefined
        };
  
        const response = await axios.get('/api/v2/shops/locations', { 
          params,
          signal: controller.signal 
        });
        
        // Verify API response matches current filters
        const filteredShops = response.data.shops.filter(shop => {
          const matchesCategory = selectedCategory === 'All' || shop.category === selectedCategory;
          const matchesRegion = selectedRegion === 'All' || shop.region === selectedRegion;
          return matchesCategory && matchesRegion;
        });
        
        setShopLocations(filteredShops);
      } catch (err) {
        if (axios.isCancel(err)) return;
        
        // Process ONLY filtered data for fallback
        const uniqueCombos = new Set();
        const locationsToGeocode = [];
  
        filteredData.forEach(item => {
          const key = `${item.area}-${item.region}`;
          if (!uniqueCombos.has(key)) {
            uniqueCombos.add(key);
            locationsToGeocode.push({
              area: item.area,
              region: item.region,
              totalSales: filteredData
                .filter(d => d.area === item.area && d.region === item.region)
                .reduce((sum, d) => sum + d.totalSales, 0)
            });
          }
        });
        
        const locations = [];
        for (const item of locationsToGeocode) {
          const geoInfo = await geocodeArea(item.area, item.region);
          if (geoInfo) {
            locations.push({
              name: `${item.area}, ${item.region}`,
              area: item.area,
              region: item.region,
              lat: geoInfo.lat,
              lon: geoInfo.lon,
              totalSales: item.totalSales || 0
            });
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        setShopLocations(locations);
      }
    };
    
    if (filteredData.length > 0) {
      fetchShopLocations();
    }
    
    return () => controller.abort();
  }, [filteredData, selectedCategory, selectedRegion, geocodeArea]);

  // Memoize area data calculations
  useEffect(() => {
    if (filteredData.length > 0) {
      if (selectedRegion === 'All') {
        const regionSummary = regions
          .filter(r => r !== 'All')
          .map(region => {
            const regionData = filteredData.filter(item => item.region === region); // Use filteredData
            const totalSales = regionData.reduce((sum, item) => sum + item.totalSales, 0);
            return { name: region, value: totalSales };
          })
          .sort((a, b) => b.value - a.value);
        setAreaData(regionSummary);
      } else {
        const regionAreas = filteredData 
          .filter(item => item.region === selectedRegion)
          .reduce((acc, item) => {
            const existingArea = acc.find(a => a.name === item.area);
            if (existingArea) {
              existingArea.value += item.totalSales;
            } else {
              acc.push({ name: item.area, value: item.totalSales });
            }
            return acc;
          }, [])
          .sort((a, b) => b.value - a.value);
        setAreaData(regionAreas);
      }
    }
  }, [selectedRegion, salesData, regions]);

  // Memoize region comparison data
  const regionComparisonData = useMemo(() => 
    regions
      .filter(region => region !== 'All')
      .map(region => {
        const regionData = filteredData.filter(item => item.region === region);
        const totalSales = regionData.reduce((sum, item) => sum + item.totalSales, 0);
        const totalQuantity = regionData.reduce((sum, item) => sum + item.totalQuantity, 0);
        
        return {
          region,
          totalSales,
          totalQuantity
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales),
    [filteredData, regions]
  );

  // Get the best area within each region for recommendations
  const getBestAreaRecommendation = () => {
    if (selectedRegion === 'All') {
      if (regionComparisonData.length === 0) return "No data available";
      
      const bestRegion = regionComparisonData[0].region;
      const bestRegionSales = regionComparisonData[0].totalSales;
      
      // Find the best area within the best region
      const bestRegionAreas = salesData
        .filter(item => item.region === bestRegion)
        .reduce((acc, item) => {
          const existingArea = acc.find(a => a.name === item.area);
          if (existingArea) {
            existingArea.value += item.totalSales;
          } else {
            acc.push({ name: item.area, value: item.totalSales });
          }
          return acc;
        }, [])
        .sort((a, b) => b.value - a.value);
      
      if (bestRegionAreas.length === 0) return `${bestRegion} region has the highest sales (Rs${bestRegionSales.toLocaleString()})`;
      
      const bestArea = bestRegionAreas[0].name;
      const bestAreaSales = bestRegionAreas[0].value;
      
      return `${bestArea} area in ${bestRegion} region has the highest sales (Rs${bestAreaSales.toLocaleString()})`;
    } else {
      // For a specific region, show the best area
      if (areaData.length === 0) return `No areas found in ${selectedRegion}`;
      
      const bestArea = areaData[0].name;
      const bestAreaSales = areaData[0].value;
      
      return `${bestArea} area in ${selectedRegion} has the highest sales (Rs${bestAreaSales.toLocaleString()})`;
    }
  };

  // Helper function to generate sample data - ensures areas are included
  function generateSampleData() {
    const regions = ['Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Quetta'];
    const areas = {
      'Islamabad': ['Blue Area', 'F-7', 'F-10', 'I-8'],
      'Lahore': ['DHA', 'Gulberg', 'Johar Town', 'Model Town'],
      'Karachi': ['Clifton', 'Defence', 'Gulshan', 'Saddar'],
      'Peshawar': ['Hayatabad', 'University Town', 'Saddar', 'Cantonment'],
      'Quetta': ['Jinnah Road', 'Satellite Town', 'Chiltan Housing', 'Airport Road']
    };
    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Fitness'];
    
    const data = [];
    
    regions.forEach(region => {
      areas[region].forEach(area => {
        categories.forEach(category => {
          const totalSales = Math.floor(Math.random() * 500000) + 100000;
          const totalQuantity = Math.floor(Math.random() * 500) + 100;
          
          data.push({
            region,
            area,
            category,
            totalSales,
            totalQuantity
          });
        });
      });
    });
    
    return data;
  }

  // Process raw data from API to ensure area information is properly included
  async function processRawData(rawData) {
    // For each unique region+area combination, try to get geocoding information
    const processedData = [...rawData];
    
    // Get all unique region+area combinations for later geocoding
    const uniqueCombinations = new Set();
    processedData.forEach(item => {
      if (item.region && item.area) {
        uniqueCombinations.add(`${item.region}-${item.area}`);
      }
    });
    
    return processedData;
  }
  
  // Handle click on chart item to open map modal
  const handleAreaClick = useCallback(async (areaName, regionName) => {
   // Check if location exists in FILTERED data
  const existsInData = filteredData.some(d => 
    d.area === areaName && d.region === regionName
  );

  if (!existsInData) return;
  // First check if we already have this location
  const existingLocation = shopLocations.find(
    loc => loc.area === areaName && loc.region === regionName
  );
    if (existingLocation) {
      // Set the location for the modal
      setModalLocation(existingLocation);
      setShowMapModal(true);
      return;
    }
    
    // Otherwise geocode the location
    const geoInfo = await geocodeArea(areaName, regionName);
    const totalSales = areaName
    ? salesData.filter(item => item.area === areaName && item.region === regionName)
              .reduce((sum, item) => sum + item.totalSales, 0)
    : salesData.filter(item => item.region === regionName)
              .reduce((sum, item) => sum + item.totalSales, 0);
    
    if (geoInfo) {
      // Update the totalSales calculation in handleAreaClick
      const newLocation = {
        name: areaName ? `${areaName}, ${regionName}` : regionName,
        area: areaName || 'Regional Total',
        region: regionName,
        lat: geoInfo.lat,
        lon: geoInfo.lon,
        totalSales: totalSales
};
      
      // Set the location for the modal
      setModalLocation(newLocation);
      setShowMapModal(true);
      
      // Also add to our locations for later use
      setShopLocations(prev => [...prev, newLocation]);
    } else {
      console.error("Could not geocode location:", areaName, regionName);
    }
  }, [shopLocations, geocodeArea, salesData]);

  // Custom rendering for pie chart with click handler
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g onClick={() => handleAreaClick(payload.name, selectedRegion)}>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#5a4336" className="font-medium cursor-pointer">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#5a4336">
          Rs{value.toLocaleString()}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ cursor: 'pointer' }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 15}
          outerRadius={outerRadius + 20}
          fill={fill}
          style={{ cursor: 'pointer' }}
        />
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Map component that automatically updates when center changes
  const MapView = ({ center, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
      map.setView(center, zoom);
    }, [map, center, zoom]);
    
    return null;
  };

  // Get max sales for heatmap scaling - ensure a default value if no data available
  const maxSales = useMemo(() => 
    shopLocations.length > 0 
      ? Math.max(...shopLocations.map(loc => loc.totalSales || 0))
      : 500000,
    [shopLocations] // Recaluclate when shopLocations change
  );

  if (loading) {
        return <Loader />;

  }

  // Map modal component
  const MapModal = ({ location, onClose }) => {
    if (!location) return null;
    
    return (

       
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      
      style={modalStyle}>
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: '#d8c4b8' }}>
            <h3 className="text-xl font-bold" style={{ color: '#5a4336' }}>{location.name}</h3>
            <button 
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f8f5f2' }}>
                <h4 className="font-semibold mb-2" style={{ color: '#5a4336' }}>Region</h4>
                <p>{location.region}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f8f5f2' }}>
                <h4 className="font-semibold mb-2" style={{ color: '#5a4336' }}>Area</h4>
                <p>{location.area || 'Regional Overview'}</p>
                </div>
              <div className="bg-gray-50 p-4 rounded-lg" style={{ backgroundColor: '#f8f5f2' }}>
                <h4 className="font-semibold mb-2" style={{ color: '#5a4336' }}>Total Sales</h4>
                <p className="font-medium">Rs{location.totalSales.toLocaleString()}</p>
              </div>
            </div>
            
            <div style={{ height: '400px', width: '100%' }} className="rounded-lg overflow-hidden">
              <MapContainer
                center={[location.lat, location.lon]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <Marker position={[location.lat, location.lon]}>
                  <Popup>
                    <div>
                      <h3 className="font-medium">{location.name}</h3>
                      <p>Total Sales: Rs{location.totalSales.toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
                
                <Circle
                  center={[location.lat, location.lon]}
                  radius={(location.totalSales / (maxSales || 1)) * 5000 + 1000}
                  pathOptions={{
                    fillColor: '#a67d6d',
                    fillOpacity: 0.5,
                    color: '#5a4336',
                    weight: 1
                  }}
                />
              </MapContainer>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end" style={{ borderColor: '#d8c4b8' }}>
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: '#c8a4a5',
                backgroundImage: 'linear-gradient(to right, #c8a4a5, #8c6c6b)',
                color: 'white'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Tab navigation component
  const NavigationTabs = () => {
    return (
      <div className="flex mb-6 border-b" style={{ borderColor: '#d8c4b8' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === 'dashboard' 
              ? 'border-b-2 text-5a4336' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          style={{ 
            borderColor: activeTab === 'dashboard' ? '#5a4336' : 'transparent',
            color: activeTab === 'dashboard' ? '#5a4336' : undefined
          }}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === 'charts' 
              ? 'border-b-2 text-5a4336' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          style={{ 
            borderColor: activeTab === 'charts' ? '#5a4336' : 'transparent',
            color: activeTab === 'charts' ? '#5a4336' : undefined
          }}
        >
          Sales Charts
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === 'heatmap' 
              ? 'border-b-2 text-5a4336' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          style={{ 
            borderColor: activeTab === 'heatmap' ? '#5a4336' : 'transparent',
            color: activeTab === 'heatmap' ? '#5a4336' : undefined
          }}
        >
          Location Heatmap
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`py-3 px-6 font-medium transition-colors ${
            activeTab === 'data' 
              ? 'border-b-2 text-5a4336' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          style={{ 
            borderColor: activeTab === 'data' ? '#5a4336' : 'transparent',
            color: activeTab === 'data' ? '#5a4336' : undefined
          }}
        >
          Detailed Data
        </button>
      </div>
    );
  };

  // Filters component for consistent UI across tabs
  const FiltersPanel = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center" style={{ backgroundColor: '#fff' }}>
        <div className="flex items-center">
          <label className="font-medium mr-2" style={{ color: '#5a4336' }}>Category:</label>
          <select 
            className="border rounded p-2 bg-white"
            style={{ borderColor: '#d8c4b8' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <label className="font-medium mr-2" style={{ color: '#5a4336' }}>Region:</label>
          <select 
            className="bborder rounded p-2 bg-white focus:ring-2 focus:ring-[#c8a4a5] focus:border-[#c8a4a5] outline-none transition-all"
            style={{ borderColor: '#d8c4b8' }}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Dashboard page content
  const DashboardContent = () => {
    return (
      <>
        <div className="mb-6">
          <div className="p-4 rounded-lg shadow-sm mb-4 bg-white">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>Sales Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Key metrics cards */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f1f1', borderLeft: '4px solid #a67d6d' }}>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h4>
                <p className="text-2xl font-bold" style={{ color: '#5a4336' }}>
                  Rs{filteredData.reduce((sum, item) => sum + item.totalSales, 0).toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f1f1', borderLeft: '4px solid #c8a4a5' }}>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Units Sold</h4>
                <p className="text-2xl font-bold" style={{ color: '#5a4336' }}>
                  {filteredData.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f1f1', borderLeft: '4px solid #5a4336' }}>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Regions</h4>
                <p className="text-2xl font-bold" style={{ color: '#5a4336' }}>
                  {regions.length - 1}
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f7f1f1', borderLeft: '4px solid #d8c4b8' }}>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Categories</h4>
                <p className="text-2xl font-bold" style={{ color: '#5a4336' }}>
                  {categories.length - 1}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg shadow-sm mb-6 bg-white" style={{ borderLeft: '4px solid #a67d6d' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#5a4336' }}>Optimization Recommendation</h3>
          <div className="p-3 rounded-md" style={{ backgroundColor: '#f7f1f1', border: '1px solid #d8c4b8' }}>
            <p className="font-medium" style={{ color: '#5a4336' }}>
              <span className="font-bold">Best Location: </span> 
              {getBestAreaRecommendation()}
            </p>
            <p className="mt-2" style={{ color: '#5a4336' }}>
              Opening a new shop in this area would likely yield the best results based on historical sales data.
            </p>
            <button 
               className="mt-2 px-4 py-2  rounded-lg transition-colors"
               style={{ 
                 backgroundColor: '#c8a4a5',
                 backgroundImage: 'linear-gradient(to right, #c8a4a5, #8c6c6b)',
                 color: 'white'
               }}
              onClick={() => {
                const bestLocation = areaData[0];
                if (bestLocation) {
                  handleAreaClick(
                    selectedRegion === 'All' ? null : bestLocation.name,
                    selectedRegion === 'All' ? bestLocation.name : selectedRegion
                  );
                }
              }}
            >
              View on Map
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>Region Comparison</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionComparisonData.slice(0, 5)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" style={{ stroke: '#d8c4b8' }} />
                  <XAxis dataKey="region" style={{ fill: '#5a4336' }} />
                  <YAxis style={{ fill: '#5a4336' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8f5f2', borderColor: '#d8c4b8' }}
                    formatter={(value) => [`RS${value.toLocaleString()}`, 'Total Sales']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalSales" 
                    name="Total Sales" 
                    fill="#a67d6d" 
                    onClick={(data) => setSelectedRegion(data.region)}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="p-4 rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>
              {selectedRegion === 'All' ? 'Region Distribution' : `${selectedRegion} Area Distribution`}
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={areaData.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {areaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`Rs${value.toLocaleString()}`, 'Total Sales']}
                    contentStyle={{ backgroundColor: '#f8f5f2', borderColor: '#d8c4b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Charts page content
  const ChartsContent = () => {
    // Prepare data for category comparison
    const categoryData = categories
      .filter(category => category !== 'All')
      .map(category => {
        const categoryItems = filteredData.filter(item => item.category === category);
        const totalSales = categoryItems.reduce((sum, item) => sum + item.totalSales, 0);
        const totalQuantity = categoryItems.reduce((sum, item) => sum + item.totalQuantity, 0);
        
        return {
          category,
          totalSales,
          totalQuantity,
          avgPrice: totalQuantity > 0 ? totalSales / totalQuantity : 0
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);
      
    // Prepare category by region data
    const categoryByRegionData = [];
    
    if (selectedCategory !== 'All') {
      regions
        .filter(region => region !== 'All')
        .forEach(region => {
          const regionItems = filteredData.filter(item => item.region === region);
          const totalSales = regionItems.reduce((sum, item) => sum + item.totalSales, 0);
          
          categoryByRegionData.push({
            region,
            totalSales
          });
        });
    } else {
      // When all categories are selected, get top 3 categories per region
      regions
        .filter(region => region !== 'All')
        .forEach(region => {
          // Get all category data for this region
          const categoryPerformance = categories
            .filter(category => category !== 'All')
            .map(category => {
              const items = salesData.filter(
                item => item.region === region && item.category === category
              );
              return {
                category,
                totalSales: items.reduce((sum, item) => sum + item.totalSales, 0)
              };
            })
            .sort((a, b) => b.totalSales - a.totalSales);
          
          categoryByRegionData.push({
            region,
            ...categoryPerformance.reduce((obj, item, index) => {
              if (index < 3) { // Only include top 3 categories
                obj[`${item.category}`] = item.totalSales;
              }
              return obj;
            }, {})
          });
        });
    }
    
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>Category Performance</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" style={{ stroke: '#d8c4b8' }} />
                  <XAxis dataKey="category" style={{ fill: '#5a4336' }} />
                  <YAxis style={{ fill: '#5a4336' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8f5f2', borderColor: '#d8c4b8' }}
                    formatter={(value, name) => {
                      if (name === 'totalSales') return [`Rs${value.toLocaleString()}`, 'Total Sales'];
                      if (name === 'avgPrice') return [`Rs${value.toFixed(2)}`, 'Avg Price'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalSales" 
                    name="Total Sales" 
                    fill="#a67d6d" 
                    onClick={(data) => setSelectedCategory(data.category)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="avgPrice" 
                    name="Avg Price" 
                    fill="#c8a4a5" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="p-4 rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>
              {selectedCategory === 'All' 
                ? 'Top Categories by Region' 
                : `${selectedCategory} Performance by Region`}
            </h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryByRegionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" style={{ stroke: '#d8c4b8' }} />
                  <XAxis dataKey="region" style={{ fill: '#5a4336' }} />
                  <YAxis style={{ fill: '#5a4336' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8f5f2', borderColor: '#d8c4b8' }}
                    formatter={(value, name) => [`Rs${value.toLocaleString()}`, name]}
                  />
                  <Legend />
                  {selectedCategory !== 'All' ? (
                    <Bar 
                      dataKey="totalSales" 
                      name={selectedCategory}
                      fill="#5a4336" 
                      onClick={(data) => setSelectedRegion(data.region)}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    // For "All" categories, show top 3 categories per region
                    Object.keys(categoryByRegionData[0] || {})
                      .filter(key => key !== 'region')
                      .map((category, index) => (
                        <Bar 
                          key={category}
                          dataKey={category} 
                          name={category}
                          fill={COLORS[index % COLORS.length]}
                          style={{ cursor: 'pointer' }}
                        />
                      ))
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Area breakdown for selected region */}
        {selectedRegion !== 'All' && (
          <div className="p-4 rounded-lg shadow-sm bg-white mb-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>
              Area Breakdown for {selectedRegion}
            </h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={areaData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" style={{ stroke: '#d8c4b8' }} />
                  <XAxis type="number" style={{ fill: '#5a4336' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    style={{ fill: '#5a4336' }} 
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8f5f2', borderColor: '#d8c4b8' }}
                    formatter={(value) => [`Rs${value.toLocaleString()}`, 'Total Sales']}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Total Sales" 
                    fill="#a67d6d" 
                    onClick={(data) => handleAreaClick(data.name, selectedRegion)}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </>
    );
  };

  // Location heatmap content
  const HeatmapContent = () => {
      // Filter shop locations based on current selections
  const filteredShopLocations = useMemo(() => 
    shopLocations.filter(loc => {
      const matchesCategory = selectedCategory === 'All' || 
        filteredData.some(d => d.area === loc.area && d.category === selectedCategory);
      const matchesRegion = selectedRegion === 'All' || loc.region === selectedRegion;
      return matchesCategory && matchesRegion;
    }),
    [shopLocations, selectedCategory, selectedRegion, filteredData]
  );

  // Get max sales from FILTERED locations
  const maxSales = useMemo(() => 
    filteredShopLocations.length > 0 
      ? Math.max(...filteredShopLocations.map(loc => loc.totalSales || 0))
      : 500000,
    [filteredShopLocations]
  );
    return (
      <>
        <div className="p-4 rounded-lg shadow-sm mb-6 bg-white">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>Sales Heatmap
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Showing top {shopLocations.length} sales locations)
          </span>
          </h3>
          <p className="mb-4 text-gray-600">
            This map shows the distribution of sales across different locations. 
            Larger circles indicate higher sales volume. Click on any marker for details.
          </p>
          
          <div style={{ height: '600px', width: '100%' }} className="rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {shopLocations.map((location, index) => (
                <React.Fragment key={index}>
                  <Marker 
                    position={[location.lat, location.lon]}
                    eventHandlers={{
                      click: () => {
                        setSelectedLocation(location);
                        setMapCenter([location.lat, location.lon]);
                        setMapZoom(12);
                      }
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-medium">{location.name}</h3>
                        <p>Total Sales: Rs{location.totalSales.toLocaleString()}</p>
                        <button
                          className="mt-2 px-2 py-1 text-xs rounded text-white"
                          style={{ backgroundColor: '#a67d6d' }}
                          onClick={() => {
                            setModalLocation(location);
                            setShowMapModal(true);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                  
                  <Circle
                    center={[location.lat, location.lon]}
                    radius={(location.totalSales / (maxSales || 1)) * 5000 + 1000}
                    pathOptions={{
                      fillColor: '#a67d6d',
                      fillOpacity: 0.5,
                      color: '#5a4336',
                      weight: 1
                    }}
                  />
                </React.Fragment>
              ))}
              
              <MapView center={mapCenter} zoom={mapZoom} />
            </MapContainer>
          </div>
          </div>
          <div className="p-4 rounded-lg shadow-sm bg-white">
  <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>
  Top Performing Locations ({selectedRegion !== 'All' ? selectedRegion : 'All Regions'})    <span className="ml-2 text-sm font-normal text-gray-500">
    </span>
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredShopLocations
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 6)
            .map((location, index) => (
        <div 
          key={index} 
          className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md"
          style={{ backgroundColor: '#f7f1f1', borderLeft: '4px solid #a67d6d' }}
          onClick={() => {
            setModalLocation(location);
            setShowMapModal(true);
          }}
        >
          <h4 className="font-medium mb-1" style={{ color: '#5a4336' }}>{location.name}</h4>
          <p className="text-sm text-gray-600 mb-2">Region: {location.region}</p>
          <p className="font-bold" style={{ color: '#5a4336' }}>Rs{location.totalSales.toLocaleString()}</p>
        </div>
      ))}
  </div>
        </div>
      </>
    );
  };

  // Detailed data table content
  const DataTableContent = () => {
    // Group data by region and area
    const groupedData = filteredData.reduce((acc, item) => {
      const key = `${item.region}-${item.area}`;
      
      if (!acc[key]) {
        acc[key] = {
          region: item.region,
          area: item.area,
          categories: [],
          totalSales: 0,
          totalQuantity: 0
        };
      }
      
      acc[key].categories.push(item.category);
      acc[key].totalSales += item.totalSales;
      acc[key].totalQuantity += item.totalQuantity;
      
      return acc;
    }, {});
    
    // Convert to array and sort by sales
    const tableData = Object.values(groupedData).sort((a, b) => b.totalSales - a.totalSales);
    
    return (
      <>
        <div className="p-4 rounded-lg shadow-sm bg-white mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#5a4336' }}>Detailed Sales Data</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#f8f5f2' }}>
                  <th className="p-3 text-left border-b" style={{ color: '#5a4336', borderColor: '#d8c4b8' }}>Region</th>
                  <th className="p-3 text-left border-b" style={{ color: '#5a4336', borderColor: '#d8c4b8' }}>Area</th>
                  <th className="p-3 text-left border-b" style={{ color: '#5a4336', borderColor: '#d8c4b8' }}>Categories</th>
                  <th className="p-3 text-right border-b" style={{ color: '#5a4336', borderColor: '#d8c4b8' }}>Total Sales</th>
                  <th className="p-3 text-right border-b" style={{ color: '#5a4336', borderColor: '#d8c4b8' }}>Quantity</th>
                  <th className="p-3 text-right border-b" style={{ color: '#5a4336', borderColor: '#d8c4b8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border-b" style={{ borderColor: '#d8c4b8' }}>{row.region}</td>
                    <td className="p-3 border-b" style={{ borderColor: '#d8c4b8' }}>{row.area}</td>
                    <td className="p-3 border-b" style={{ borderColor: '#d8c4b8' }}>
                      {row.categories.length > 3 
                        ? `${row.categories.slice(0, 3).join(', ')} +${row.categories.length - 3} more`
                        : row.categories.join(', ')}
                    </td>
                    <td className="p-3 text-right border-b font-medium" style={{ borderColor: '#d8c4b8', color: '#5a4336' }}>
                      Rs{row.totalSales.toLocaleString()}
                    </td>
                    <td className="p-3 text-right border-b" style={{ borderColor: '#d8c4b8' }}>
                      {row.totalQuantity.toLocaleString()}
                    </td>
                    <td className="p-3 text-right border-b" style={{ borderColor: '#d8c4b8' }}>
                      <button
                         className="px-4 py-2 rounded-lg transition-colors"
                         style={{ 
                           backgroundColor: '#c8a4a5',
                           backgroundImage: 'linear-gradient(to right, #c8a4a5, #8c6c6b)',
                           color: 'white'
                         }}
                        onClick={() => handleAreaClick(row.area, row.region)}
                      >
                        View Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="relative">
      <header className="relative z-50" style={{ zIndex: 1000 }}>
        <Header activeHeading={8}/>
       
        
    </header>

    <div className="min-h-screen bg-[#f7f1f1] p-6">
<div className="text-center mb-12">
<h1 className="text-4xl font-bold text-[#5a4336] pb-2">Region and Area analysis dashboard</h1>
<div className="w-24 h-1 bg-[#c8a4a5] mx-auto rounded-full"></div>
          
          {error && (
            <div className="text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              {error}
            </div>
          )}
        </div>
        
        <NavigationTabs />
        <FiltersPanel />
        
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'charts' && <ChartsContent />}
        {activeTab === 'heatmap' && <HeatmapContent />}
        {activeTab === 'data' && <DataTableContent />}
      </div>
      
      {showMapModal && modalLocation && (
        <MapModal 
          location={modalLocation} 
          onClose={() => {
            setShowMapModal(false);
            setModalLocation(null);
          }} 
        />
      )}
      <Footer />
    </div>
  );
};

export default RegionAreaAnalysisDashboard;