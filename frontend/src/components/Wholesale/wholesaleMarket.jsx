import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer'
import { MapPin, X, Navigation, AlertCircle, Check, Filter, ArrowLeft, Loader } from 'lucide-react';
import '../../App.css';
import {
    getAllWholesaleMarkets,
    createWholesaleMarket,
    clearErrors,
} from '../../redux/actions/wholesaleMarketActions';
import WholesaleSuppliers from './wholesaleSupplier'; // Import your suppliers component

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

// Embedded Map Component
const EmbeddedMap = ({ userLocation, destination, onClose }) => {
    const mapContainerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mapError, setMapError] = useState(null);
    const [focusedLocation, setFocusedLocation] = useState('both'); // 'user', 'destination', or 'both'

    useEffect(() => {
        // Load the Leaflet script dynamically
        const loadLeaflet = async () => {
            try {
                setIsLoading(true);
                
                // Create and append CSS link for Leaflet
                const cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
                document.head.appendChild(cssLink);
                
                // Create and append Leaflet script
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
                script.async = true;
                
                // Create and append Leaflet Routing Machine script
                const routingScript = document.createElement('script');
                routingScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.min.js';
                routingScript.async = true;
                
                // Wait for scripts to load
                const scriptLoaded = new Promise((resolve) => {
                    script.onload = resolve;
                });
                
                const routingScriptLoaded = new Promise((resolve) => {
                    routingScript.onload = resolve;
                });
                
                document.body.appendChild(script);
                
                await scriptLoaded;
                document.body.appendChild(routingScript);
                
                await routingScriptLoaded;
                
                // Initialize map once scripts are loaded
                initializeMap();
            } catch (error) {
                console.error('Error loading map:', error);
                setMapError('Failed to load map. Please try again.');
                setIsLoading(false);
            }
        };
        
        const initializeMap = () => {
            if (!window.L) {
                setMapError('Map library failed to load. Please refresh and try again.');
                setIsLoading(false);
                return;
            }
            
            try {
                // Create map instance
                const map = window.L.map(mapContainerRef.current).setView(
                    [userLocation.lat, userLocation.lng], 
                    13
                );
                
                // Add tile layer (OpenStreetMap)
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Create more visually distinct icons for user location and destination
                const userIcon = window.L.divIcon({
                    html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold animate-pulse-slow">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>`,
                    className: 'custom-div-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                
                const destinationIcon = window.L.divIcon({
                    html: `<div class="w-8 h-8 rounded-full bg-[#c8a4a5] border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </div>`,
                    className: 'custom-div-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                
                // Add custom CSS for pulse animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes pulse-slow {
                      0%, 100% { opacity: 1; transform: scale(1); }
                      50% { opacity: 0.8; transform: scale(1.1); }
                    }
                    .animate-pulse-slow {
                      animation: pulse-slow 2s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(style);
                
                // Add markers with improved popups
                const userMarker = window.L.marker([userLocation.lat, userLocation.lng], {icon: userIcon})
                    .addTo(map);
                
                // Get reverse geocoding to display user location name
                const reverseGeocode = async (lat, lng) => {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                        const data = await response.json();
                        return data.display_name || "Your Current Location";
                    } catch (error) {
                        console.error("Error getting location name:", error);
                        return "Your Current Location";
                    }
                };
                
                // Set initial popup content
                userMarker.bindPopup(
                    `<div class="font-bold text-blue-600">Your Location</div>
                     <div class="text-sm mt-1">Loading location details...</div>`,
                    {closeButton: false, className: 'custom-popup'}
                );
                
                // Update popup with actual location name
                reverseGeocode(userLocation.lat, userLocation.lng).then(locationName => {
                    userMarker.setPopupContent(
                        `<div class="font-bold text-blue-600">Your Location</div>
                         <div class="text-sm mt-1">${locationName}</div>`,
                        {closeButton: false, className: 'custom-popup'}
                    );
                });
                
                const destMarker = window.L.marker([destination.lat, destination.lon], {icon: destinationIcon})
                    .addTo(map)
                    .bindPopup(
                        `<div class="font-bold text-[#c8a4a5]">${destination.displayName}</div>
                         <div class="text-sm mt-1">Distance: ${(destination.distance || 0).toFixed(1)}km</div>`,
                        {closeButton: false, className: 'custom-popup'}
                    );
                
                // Create routing control
                const routingControl = window.L.Routing.control({
                    waypoints: [
                        window.L.latLng(userLocation.lat, userLocation.lng),
                        window.L.latLng(destination.lat, destination.lon)
                    ],
                    routeWhileDragging: false,
                    showAlternatives: true,
                    fitSelectedRoutes: true,
                    lineOptions: {
                        styles: [
                            {color: '#c8a4a5', opacity: 0.8, weight: 6},
                            {color: '#8c6c6b', opacity: 0.5, weight: 2}
                        ]
                    },
                    createMarker: function() { return null; } // Don't create default markers
                }).addTo(map);
                
                // Fit bounds to show both points
                const bounds = window.L.latLngBounds(
                    [userLocation.lat, userLocation.lng],
                    [destination.lat, destination.lon]
                );
                map.fitBounds(bounds, {padding: [50, 50]});
                
                // Function to update the focus when buttons are clicked
                const updateFocus = (focus) => {
                    setFocusedLocation(focus);
                    
                    if (focus === 'user') {
                        map.setView([userLocation.lat, userLocation.lng], 16, {
                            animate: true,
                            duration: 1
                        });
                        userMarker.openPopup();
                        destMarker.closePopup();
                    } else if (focus === 'destination') {
                        map.setView([destination.lat, destination.lon], 16, {
                            animate: true,
                            duration: 1
                        });
                        destMarker.openPopup();
                        userMarker.closePopup();
                    } else {
                        map.fitBounds(bounds, {
                            padding: [50, 50],
                            animate: true,
                            duration: 1
                        });
                        userMarker.closePopup();
                        destMarker.closePopup();
                    }
                };
                
                // Store the focus update function in a ref accessible from the JSX
                window.updateMapFocus = updateFocus;
                
                setIsLoading(false);
                
                // Clean up on unmount
                return () => {
                    map.remove();
                    delete window.updateMapFocus;
                    if (style.parentNode) {
                        document.head.removeChild(style);
                    }
                };
            } catch (error) {
                console.error('Error initializing map:', error);
                setMapError('Failed to initialize map. Please try again.');
                setIsLoading(false);
            }
        };
        
        loadLeaflet();
        
        // Clean-up function
        return () => {
            const leafletScript = document.querySelector('script[src*="leaflet.js"]');
            const routingScript = document.querySelector('script[src*="leaflet-routing-machine"]');
            const leafletCss = document.querySelector('link[href*="leaflet.css"]');
            
            if (leafletScript) document.body.removeChild(leafletScript);
            if (routingScript) document.body.removeChild(routingScript);
            if (leafletCss) document.head.removeChild(leafletCss);
            
            // Remove global function
            delete window.updateMapFocus;
        };
    }, [userLocation, destination]);
    
    return (
        
        <div className="fixed inset-0 z-50 bg-[#f7f1f1] flex flex-col">
                        <Header activeHeading={4} />
                        

            <div className="bg-white p-4 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="bg-[#c8a4a5]/10 hover:bg-[#c8a4a5]/20 text-[#c8a4a5] p-2 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg font-medium text-[#5a4336]">
                        Directions to {destination.displayName}
                    </h2>
                </div>
                <div className="bg-[#f7f1f1] px-3 py-1 rounded-full text-sm text-[#5a4336] flex items-center gap-1">
                    <Navigation size={16} className="text-[#c8a4a5]" />
                    {(destination.distance || 0).toFixed(1)}km away
                </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="bg-white p-2 shadow-sm flex justify-center space-x-2">
                
                <button 
                    onClick={() => window.updateMapFocus('destination')}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                        focusedLocation === 'destination' 
                            ? 'bg-[#c8a4a5] text-white shadow-sm' 
                            : 'bg-gray-100 text-[#5a4336] hover:bg-gray-200'
                    }`}
                >
                    <div className="w-3 h-3 rounded-full bg-[#c8a4a5] border border-white"></div>
                    Destination
                </button>
                <button 
                    onClick={() => window.updateMapFocus('both')}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                        focusedLocation === 'both' 
                            ? 'bg-[#5a4336] text-white shadow-sm' 
                            : 'bg-gray-100 text-[#5a4336] hover:bg-gray-200'
                    }`}

                    
                >
                    <Navigation size={14} />
                    Show Route
                </button>
            </div>
            
            <div className="relative flex-grow">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                        <div className="flex flex-col items-center">
                            <Loader size={40} className="text-[#c8a4a5] animate-spin mb-3" />
                            <p className="text-[#5a4336] font-medium">Loading map...</p>
                        </div>
                    </div>
                )}
                
                {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                            <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-[#5a4336] mb-2">Map Error</h3>
                            <p className="text-gray-600 mb-4">{mapError}</p>
                            <button 
                                onClick={onClose}
                                className="bg-[#c8a4a5] text-white py-2 px-6 rounded-lg hover:bg-[#8c6c6b] transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                )}
                
                <div 
                    ref={mapContainerRef} 
                    className="w-full h-full z-0"
                    style={{ minHeight: '300px' }}
                ></div>
            </div>
            
            {/* Bottom Action Bar */}
            <div className="bg-white py-2 px-4 shadow-inner border-t border-gray-200 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-[#f7f1f1] px-4 py-1.5 rounded-full">
                    <Navigation size={16} className="text-[#c8a4a5]" />
                    <span className="font-medium text-[#5a4336]">{(destination.distance || 0).toFixed(1)} km</span>
                </div>
            </div>
        </div>
    );
};

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
                            ? "View Directions to Nearest"
                            : "View Directions"
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
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [activeTab, setActiveTab] = useState('markets'); // Add this state

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
                    setShowLocationModal(true);
                }
            } catch (error) {
                console.error('Error requesting location permission:', error);
                setLocationStatus('Error accessing location services.');
                setShowLocationModal(true);
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
                    setShowLocationModal(true);
                }
            );
        };
        requestLocationPermission();
        dispatch(getAllWholesaleMarkets());
    }, [dispatch]);

    //Haversine formula
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
        if (!userLocation || !market.allLocations?.length) {
            setShowLocationModal(true);
            return;
        }
    
        const nearestLocation = findNearestLocation(market.allLocations, userLocation);
        if (!nearestLocation) return;
        
        // Set the destination and show the map
        setSelectedDestination(nearestLocation);
        setShowMap(true);
    };

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
    <div className="flex justify-center gap-8 mb-4">
      <button 
        onClick={() => setActiveTab('markets')}
        className={`text-3xl font-bold pb-2 ${
          activeTab === 'markets' 
            ? 'text-[#5a4336] border-b-4 border-[#c8a4a5]' 
            : 'text-gray-400 hover:text-[#5a4336] transition-colors'
        }`}
      >
        Markets
      </button>
      <button 
        onClick={() => setActiveTab('suppliers')}
        className={`text-3xl font-bold pb-2 ${
          activeTab === 'suppliers' 
            ? 'text-[#5a4336] border-b-4 border-[#c8a4a5]' 
            : 'text-gray-400 hover:text-[#5a4336] transition-colors'
        }`}
      >
        Suppliers
      </button>
    </div>
    <div className="w-24 h-1 bg-[#c8a4a5] mx-auto rounded-full"></div>
  </div>

                {/* Conditional Content */}
  {activeTab === 'markets' ? (
    <>
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
                </>
  ) : (
    <WholesaleSuppliers userLocation={userLocation} />
  )}
                
                {location.pathname === '/wholesale-markets' && (
                    <button
                        onClick={() => navigate('/')}
                        className="fixed bottom-6 right-6 bg-[#5a4336] text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:bg-[#8c6c6b] transform hover:scale-105"
                    >
                        Back
                    </button>
                )}
            </div>
            <Footer />

            {/* Location Permission Modal */}
            {showLocationModal && (
                <LocationRequestModal 
                    onClose={() => setShowLocationModal(false)}
                    onEnableLocation={() => {
                        setShowLocationModal(false);
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
                    }}
                />
            )}

            {/* Embedded Map */}
            {showMap && selectedDestination && userLocation && (
                
                <EmbeddedMap 
                    userLocation={userLocation}
                    destination={selectedDestination}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    );
};

export default WholesaleMarketManagement;