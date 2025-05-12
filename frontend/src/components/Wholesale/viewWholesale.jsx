import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllWholesaleMarkets, clearErrors } from '../../redux/actions/wholesaleMarketActions';

const ViewWholesaleMarkets = () => {
    const dispatch = useDispatch();
    const { wholesaleMarkets, isLoading, error } = useSelector((state) => state.wholesaleMarket);
    const [userLocation, setUserLocation] = useState(null);
    const [filteredMarkets, setFilteredMarkets] = useState([]);
    const [radiusFilter, setRadiusFilter] = useState(10);
    const [locationStatus, setLocationStatus] = useState('');

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

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Get address details from coordinates using Nominatim's reverse geocoding
    const getAddressFromCoordinates = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching address:', error);
            return null;
        }
    };

    // Parse location string to extract coordinates
    const parseLocation = (locationString) => {
        try {
            const locations = locationString.split(' | ');
            const firstLocation = locations[0];
            const coordMatch = firstLocation.match(/\(Lat: ([-\d.]+), Lon: ([-\d.]+)\)/);
            
            if (coordMatch) {
                return {
                    lat: parseFloat(coordMatch[1]),
                    lon: parseFloat(coordMatch[2]),
                    displayName: firstLocation.split(' (Lat')[0].trim()
                };
            }
            return null;
        } catch (error) {
            console.error('Error parsing location:', error);
            return null;
        }
    };

    useEffect(() => {
        if (userLocation && wholesaleMarkets?.length > 0) {
            const marketsWithDistance = wholesaleMarkets
                .map(market => {
                    const parsedLocation = parseLocation(market.location);
                    if (!parsedLocation) return { ...market, distance: null };
                    
                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        parsedLocation.lat,
                        parsedLocation.lon
                    );

                    return { 
                        ...market, 
                        distance,
                        coordinates: parsedLocation
                    };
                })
                .filter(market => market.distance === null || market.distance <= radiusFilter)
                .sort((a, b) => {
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    return a.distance - b.distance;
                });
            
            setFilteredMarkets(marketsWithDistance);
        } else {
            setFilteredMarkets(wholesaleMarkets || []);
        }
    }, [wholesaleMarkets, userLocation, radiusFilter]);

    const handleGetDirections = (market) => {
        const parsedLocation = parseLocation(market.location);
        if (parsedLocation && userLocation) {
            // Use OpenStreetMap for directions
            const url = `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${parsedLocation.lat},${parsedLocation.lon}`;
            window.open(url, '_blank');
        }
    };

    const formatLocation = (locationString) => {
        const parsed = parseLocation(locationString);
        return parsed ? parsed.displayName : locationString;
    };

    return (
        <div className="p-6 bg-[#f7f1f1] min-h-screen">
            <h1 className="text-4xl font-bold text-[#5a4336] mb-8">Wholesale Markets</h1>
            
            {locationStatus && (
                <div className="mb-4 text-[#5a4336]">
                    {locationStatus}
                </div>
            )}

            {userLocation && (
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <label className="text-[#5a4336] mr-2">Filter markets within (km):</label>
                    <input
                        type="number"
                        value={radiusFilter}
                        onChange={(e) => setRadiusFilter(Number(e.target.value))}
                        className="p-2 rounded border border-[#c8a4a5] w-24"
                        min="1"
                        max="100"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                        Showing markets within {radiusFilter}km of your location
                    </p>
                </div>
            )}

            {isLoading ? (
                <div className="text-center text-xl text-[#5a4336]">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {(userLocation ? filteredMarkets : wholesaleMarkets)?.map((market) => {
                        const parsedLocation = parseLocation(market.location);
                        
                        return (
                            <div
                                key={market._id}
                                className="bg-[#f5e2e2] p-4 rounded-lg shadow-md"
                            >
                                <h3 className="text-xl font-semibold text-[#5a4336]">{market.supplierName}</h3>
                                <p className="text-[#5a4336]">{market.materialType}</p>
                                <p className="text-[#5a4336]">{formatLocation(market.location)}</p>
                                <p className="text-[#5a4336]">{market.contactInfo}</p>
                                
                                {market.distance && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {market.distance.toFixed(1)}km from your location
                                    </p>
                                )}
                                
                                {parsedLocation && userLocation && (
                                    <button
                                        onClick={() => handleGetDirections(market)}
                                        className="mt-2 bg-[#c8a4a5] text-white px-4 py-2 rounded hover:bg-[#8c6c6b]"
                                    >
                                        Get Directions
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewWholesaleMarkets;