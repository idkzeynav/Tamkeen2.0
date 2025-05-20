import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer'
import { MapPin, X, Navigation, AlertCircle, Check, Filter } from 'lucide-react';
import '../../App.css';import {
    getAllWholesaleMarkets,
    createWholesaleMarket,
    clearErrors,
} from '../../redux/actions/wholesaleMarketActions';

// Predefined categories
const PREDEFINED_CATEGORIES = [
    'Clothing and Textiles',
    'Electronics',
    'Groceries and Food Items',
    'Household Items',
    'Jewelry and Accessories',
    'Miscellaneous'
  ];
  
// Custom Alert Component
const CustomAlert = ({ message }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white border-2 border-[#c8a4a5] text-[#5a4336] px-8 py-6 rounded-xl shadow-xl flex items-center gap-4 transform animate-slideIn">
        <div className="bg-[#c8a4a5]/20 rounded-full p-2">
          <Check className="w-6 h-6 text-[#c8a4a5]" />
        </div>
        <span className="text-lg font-medium">{message}</span>
      </div>
    </div>
  );

const LocationRequestModal = ({ onClose, onEnableLocation }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="text-[#c8a4a5]" />
                    <h3 className="text-lg font-semibold text-[#5a4336]">Enable Location Services</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            <p className="text-gray-600 mb-6">
                To get directions to the market, we need access to your location. 
                Please enable location services to continue.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => {
                        onEnableLocation();
                        onClose();
                    }}
                    className="flex-1 bg-[#c8a4a5] text-white py-2 px-4 rounded-lg hover:bg-[#8c6c6b] transition-colors"
                >
                    Enable Location
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 border border-[#c8a4a5] text-[#c8a4a5] py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

const LocationsList = ({ locations = [] }) => {
    return (
        <div className="mt-3 space-y-2">
            {locations.map((loc, index) => (
                <div key={index} className="flex items-center gap-2 text-[#5a4336]">
                    <MapPin size={18} className="text-[#c8a4a5] flex-shrink-0" />
                    <span>{loc}</span>
                </div>
            ))}
        </div>
    );
};

const MarketCard = ({ market, userLocation, onGetDirections }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    if (!market) return null;
    
    const locations = market?.location ? market.location.split(' | ').map(loc => loc.split(' (Lat')[0].trim()) : [];
    const hasMultipleLocations = locations.length > 1;
    
    return (
        <div 
            className={`bg-white rounded-2xl shadow-md transition-all duration-300 ${
                isHovered ? 'transform -translate-y-2 shadow-xl' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="p-6">
                <div className="border-b border-[#e6d8d8] pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-[#5a4336] mb-2">{market.supplierName}</h3>
                    <div className="inline-block bg-[#f7f1f1] px-3 py-1 rounded-full text-sm text-[#5a4336]">
                        {market.materialType}
                    </div>
                    <p className="text-[#5a4336] mt-3">{market.contactInfo}</p>
                </div>

                <div>
                    <h4 className="text-lg font-medium text-[#5a4336] mb-2">Locations:</h4>
                    <LocationsList locations={locations} />
                </div>

                {market.distance && (
                    <div className="mt-4 bg-[#f7f1f1] p-3 rounded-lg text-sm text-[#5a4336] flex items-center gap-2">
                        <Navigation size={16} className="text-[#c8a4a5]" />
                        {hasMultipleLocations 
                            ? `Distance to nearest: ${market.distance.toFixed(1)}km`
                            : `Distance: ${market.distance.toFixed(1)}km`
                        }
                    </div>
                )}

                {market.allLocations?.length > 0 && userLocation && (
                    <button
                        onClick={() => onGetDirections(market)}
                        className="w-full mt-4 bg-gradient-to-r from-[#c8a4a5] to-[#8c6c6b] text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Navigation size={18} />
                        {hasMultipleLocations 
                            ? "Get Directions to Nearest"
                            : "Get Directions"
                        }
                    </button>
                )}
            </div>
        </div>
    );
};

const WholesaleMarketManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { wholesaleMarkets = [], isLoading, error } = useSelector((state) => state.wholesaleMarket || {});
    const { user } = useSelector((state) => state.user);
    const [userLocation, setUserLocation] = useState(null);
    const [filteredMarkets, setFilteredMarkets] = useState([]);
    const [radiusFilter, setRadiusFilter] = useState(10);
    const [locationStatus, setLocationStatus] = useState('');
    const [viewMode, setViewMode] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(['all']);
    const [showMapAlert, setShowMapAlert] = useState(false);
    const [showFilterOptions, setShowFilterOptions] = useState(false);

    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                if (result.state === 'granted') {
                    getCurrentLocation();
                } else if (result.state === 'prompt') {
                    // This will trigger the permission prompt
                    getCurrentLocation();
                } else {
                    setLocationStatus('Location permission denied. Please enable location services to see nearby markets.');
                }
            } catch (error) {
                console.error('Error requesting location permission:', error);
                setLocationStatus('Error accessing location services.');
            }
        };

        const getCurrentLocation = () => {
            setLocationStatus('Getting your location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('Location obtained successfully');
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus('Failed to get location. Please enable location services.');
                }
            );
        };
        requestLocationPermission();
        dispatch(getAllWholesaleMarkets());
    }, [dispatch]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
    
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const R = 6371.0710;
        
        return R * c;
    };

    const parseLocations = (locationString) => {
        if (!locationString) return [];
        
        try {
            const locations = locationString.split(' | ');
            return locations.map(loc => {
                const coordMatch = loc.match(/\(Lat: ([-\d.]+), Lon: ([-\d.]+)\)/);
                if (coordMatch) {
                    return {
                        displayName: loc.split(' (Lat')[0].trim(),
                        lat: parseFloat(coordMatch[1]),
                        lon: parseFloat(coordMatch[2])
                    };
                }
                return null;
            }).filter(loc => loc !== null);
        } catch (error) {
            console.error('Error parsing locations:', error);
            return [];
        }
    };

    const findNearestLocation = (locations, userLoc) => {
        if (!userLoc || !locations || locations.length === 0) return null;
        
        let nearestLocation = null;
        let shortestDistance = Infinity;

        locations.forEach(location => {
            if (location && location.lat && location.lon) {
                const distance = calculateDistance(
                    userLoc.lat,
                    userLoc.lng,
                    location.lat,
                    location.lon
                );
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestLocation = {
                        ...location,
                        distance: distance
                    };
                }
            }
        });
        
        return nearestLocation;
    };

    const handleGetDirections = (market) => {
        if (!userLocation || !market.allLocations?.length) return;
    
        const nearestLocation = findNearestLocation(market.allLocations, userLocation);
        if (!nearestLocation) return;
    
        const userLat = userLocation.lat;
        const userLng = userLocation.lng;
        const destLat = nearestLocation.lat;
        const destLon = nearestLocation.lon;

         // Show the alert before opening maps
    setShowMapAlert(true);

    // Hide alert after 3 seconds
    setTimeout(() => {
        setShowMapAlert(false);
    }, 3000);
    
        if (navigator.platform.indexOf('iPhone') !== -1 || 
            navigator.platform.indexOf('iPad') !== -1 || 
            navigator.platform.indexOf('iPod') !== -1) {
            window.location.href = `maps://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${destLat},${destLon}`;
        } else if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
            window.location.href = `geo:${userLat},${userLng}?q=${destLat},${destLon}(Destination)`;
        } else {
            setShowMapAlert(true);
            
            // Modified to open in same tab
            window.location.href = `https://www.openstreetmap.org/directions?from=${userLat},${userLng}&to=${destLat},${destLon}`;
            
            // Hide the alert after 3 seconds
            setTimeout(() => {
                setShowMapAlert(false);
            }, 3000);
        }    
    };

    useEffect(() => {
        dispatch(getAllWholesaleMarkets());
        
        if (navigator.geolocation) {
            setLocationStatus('Getting your location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('Location obtained successfully');
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationStatus('Failed to get location. Please enable location services.');
                }
            );
        } else {
            setLocationStatus('Geolocation is not supported by your browser');
        }
    }, [dispatch]);

    useEffect(() => {
        if (wholesaleMarkets?.length > 0) {
            const uniqueCategories = ['all', ...new Set(wholesaleMarkets.map(market => market.materialType))];
            setCategories(uniqueCategories);
        }
    }, [wholesaleMarkets]);

    useEffect(() => {
        if (wholesaleMarkets?.length > 0) {
            let filtered = wholesaleMarkets;
    
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(market => 
                    // Check if any of the market's material types match the selected category
                    market.materialType.includes(selectedCategory)
                );
            }
    
            if (userLocation) {
                filtered = filtered.map(market => {
                    const parsedLocations = parseLocations(market.location);
                    const nearestLocation = findNearestLocation(parsedLocations, userLocation);
                    
                    return {
                        ...market,
                        allLocations: parsedLocations,
                        distance: nearestLocation ? nearestLocation.distance : null,
                        nearestCoords: nearestLocation ? {
                            lat: nearestLocation.lat,
                            lon: nearestLocation.lon
                        } : null
                    };
                });
    
                if (viewMode === 'nearby') {
                    filtered = filtered
                        .filter(market => market.distance !== null && market.distance <= radiusFilter)
                        .sort((a, b) => a.distance - b.distance);
                }
            }
    
            setFilteredMarkets(filtered);
        } else {
            setFilteredMarkets([]);
        }
    }, [wholesaleMarkets, userLocation, radiusFilter, viewMode, selectedCategory]);

    return (
        <div className="relative">
            <Header activeHeading={4} />
            <div className="min-h-screen bg-[#f7f1f1] p-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#5a4336] pb-2">Wholesale Markets</h1>
                    <div className="w-24 h-1 bg-[#c8a4a5] mx-auto rounded-full"></div>
                </div>
                
                {/* New Filter Bar Design */}
                <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-[#e6d8d8]">
                        <div className="flex items-center space-x-3">
                            <Filter size={20} className="text-[#c8a4a5]" />
                            <h3 className="font-medium text-[#5a4336]">Filter Markets</h3>
                        </div>
                        <button 
                            onClick={() => setShowFilterOptions(!showFilterOptions)}
                            className="text-[#c8a4a5] hover:text-[#8c6c6b] transition-colors"
                        >
                            {showFilterOptions ? (
                                <X size={20} />
                            ) : (
                                <span className="text-sm bg-[#f7f1f1] px-3 py-1 rounded-full">
                                    {viewMode === 'nearby' ? 'Nearby' : 'All'} {selectedCategory !== 'all' ? `• ${selectedCategory}` : ''}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {showFilterOptions && (
                        <div className="p-4 space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <label className="text-[#5a4336] font-medium whitespace-nowrap">View Mode:</label>
                                <div className="flex bg-gray-100 rounded-lg overflow-hidden p-1">
                                    <button
                                        onClick={() => setViewMode('all')}
                                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                                            viewMode === 'all'
                                                ? 'bg-[#c8a4a5] text-white shadow-sm'
                                                : 'bg-transparent text-[#5a4336] hover:bg-gray-200'
                                        }`}
                                    >
                                        All Markets
                                    </button>
                                    <button
                                        onClick={() => setViewMode('nearby')}
                                        className={`px-4 py-2 rounded-md text-sm flex items-center gap-1 transition-colors ${
                                            viewMode === 'nearby'
                                                ? 'bg-[#c8a4a5] text-white shadow-sm'
                                                : 'bg-transparent text-[#5a4336] hover:bg-gray-200'
                                        }`}
                                    >
                                        <MapPin size={16} />
                                        Nearby
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <label className="text-[#5a4336] font-medium">Category:</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="p-2 rounded-lg border border-[#c8a4a5] text-[#5a4336] focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] appearance-none bg-white hover:border-[#8c6c6b] transition-colors select-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c8a4a5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                        backgroundSize: '1em',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    }}
                                >
                                    <option value="all" className="text-[#5a4336] bg-white hover:bg-[#f7f1f1]">All Categories</option>
                                    {PREDEFINED_CATEGORIES.map(category => (
                                        <option 
                                            key={category} 
                                            value={category} 
                                            className="text-[#5a4336] bg-white hover:bg-[#f7f1f1]"
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {viewMode === 'nearby' && userLocation && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="text-[#5a4336] font-medium whitespace-nowrap">Radius:</label>
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <input
                                            type="range"
                                            value={radiusFilter}
                                            onChange={(e) => setRadiusFilter(Number(e.target.value))}
                                            className="w-32 accent-[#c8a4a5]"
                                            min="1"
                                            max="100"
                                        />
                                        <div className="w-12 text-center font-medium text-[#5a4336]">
                                            {radiusFilter} km
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={() => setShowFilterOptions(false)}
                                    className="bg-[#c8a4a5] text-white py-2 px-4 rounded-lg hover:bg-[#8c6c6b] transition-colors text-sm font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-xl text-[#5a4336] animate-pulse">Loading markets...</div>
                        </div>
                    ) : filteredMarkets.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-xl text-[#5a4336]">No markets found with the current filters</div>
                        </div>
                    ) : (
                        filteredMarkets.map((market) => (
                            <MarketCard
                                key={market._id}
                                market={{
                                    ...market,
                                    materialType: Array.isArray(market.materialType) 
                                        ? market.materialType.join(', ') 
                                        : market.materialType
                                }}
                                userLocation={userLocation}
                                onGetDirections={handleGetDirections}
                            />
                        ))
                    )}
                </div>
                
                {location.pathname === '/wholesale-markets' && (
                    <button
                        onClick={() => navigate('/')}
                        className="fixed bottom-6 right-6 bg-[#5a4336] text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:bg-[#8c6c6b] transform hover:scale-105"
                    >
                        Back
                    </button>
                )}

                {showMapAlert && <CustomAlert message="Opening directions in maps..." />}
            </div>
            <Footer/>
        </div>
    );
};

export default WholesaleMarketManagement;