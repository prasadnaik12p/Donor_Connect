import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Hospital = ({ user }) => {
  const [hospitals, setHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]); // Store all hospitals for filtering
  const [loading, setLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [bedType, setBedType] = useState("");
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalAvailableBeds: 0,
    hospitalsWithBeds: 0,
  });
  const navigate = useNavigate();

  // Fetch all hospitals on component mount
  const fetchAllHospitals = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/hospitals/beds");
      const hospitalsData = response.data.hospitals || response.data || [];
      setAllHospitals(hospitalsData);
      applyFilters(hospitalsData, searchCity, bedType);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      alert(
        `Failed to fetch hospitals: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Normalize location string for better matching
  const normalizeLocation = (location) => {
    if (!location) return "";
    
    return location
      .toLowerCase()
      .trim()
      .replace(/[.,]/g, '') // Remove dots and commas
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\b(and|the|in|at|on|for|of)\b/g, '') // Remove common words
      .trim();
  };

  // Check if hospital matches location search
  const matchesLocation = (hospital, searchLocation) => {
    if (!searchLocation) return true;

    const normalizedSearch = normalizeLocation(searchLocation);
    if (!normalizedSearch) return true;

    // Create search patterns
    const searchTerms = normalizedSearch.split(/\s+/).filter(term => term.length > 0);
    
    // Check hospital fields for matches
    const hospitalFields = [
      hospital.city,
      hospital.state,
      hospital.address,
      hospital.name
    ].filter(field => field); // Remove empty fields

    // Check if any hospital field contains all search terms
    return hospitalFields.some(field => {
      const normalizedField = normalizeLocation(field);
      return searchTerms.every(term => normalizedField.includes(term));
    });
  };

  // Apply filters to hospitals
  const applyFilters = (hospitalsData, cityFilter, bedTypeFilter) => {
    let filteredHospitals = [...hospitalsData];

    // Apply location filter with pattern matching
    if (cityFilter && cityFilter.trim() !== "") {
      filteredHospitals = filteredHospitals.filter(hospital =>
        matchesLocation(hospital, cityFilter)
      );
    }

    // Apply bed type filter
    if (bedTypeFilter && bedTypeFilter !== "") {
      filteredHospitals = filteredHospitals.filter(hospital => {
        const bedAvailability = getBedAvailability(hospital);
        const specificBed = bedAvailability[bedTypeFilter];
        return specificBed && specificBed.available > 0;
      });
    }

    setHospitals(filteredHospitals);
    calculateStats(filteredHospitals);
  };

  // Fetch all hospitals on component mount
  useEffect(() => {
    fetchAllHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    // Clean the search input
    const cleanedCity = searchCity.trim();
    if (cleanedCity !== searchCity) {
      setSearchCity(cleanedCity);
    }

    // Apply filters to all hospitals
    applyFilters(allHospitals, cleanedCity, bedType);
  };

  const handleReset = () => {
    setSearchCity("");
    setBedType("");
    applyFilters(allHospitals, "", "");
  };

  const handleFilterChange = () => {
    // Apply filters whenever searchCity or bedType changes
    applyFilters(allHospitals, searchCity, bedType);
  };

  // Update filters when searchCity or bedType changes
  useEffect(() => {
    if (allHospitals.length > 0) {
      handleFilterChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCity, bedType, allHospitals.length]);

  const handleLogout = async () => {
    try {
      await axios.post("/hospitals/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("hospitalToken");
      localStorage.removeItem("hospital");
      window.location.reload();
    }
  };

  const getBedAvailability = (hospital) => {
    if (hospital.bedAvailability) {
      return hospital.bedAvailability;
    }

    if (hospital.hospitalBeds) {
      const beds = hospital.hospitalBeds;
      return {
        general: {
          available: beds.generalBeds?.available || 0,
          total: beds.generalBeds?.total || 0,
        },
        icu: {
          available: beds.icuBeds?.available || 0,
          total: beds.icuBeds?.total || 0,
        },
        ventilator: {
          available: beds.ventilatorBeds?.available || 0,
          total: beds.ventilatorBeds?.total || 0,
        },
        pediatricICU: {
          available: beds.pediatricIcuBeds?.available || 0,
          total: beds.pediatricIcuBeds?.total || 0,
        },
      };
    }

    return {
      general: { available: 0, total: 0 },
      icu: { available: 0, total: 0 },
      ventilator: { available: 0, total: 0 },
      pediatricICU: { available: 0, total: 0 },
    };
  };

  const calculateStats = (hospitalsData) => {
    let totalAvailableBeds = 0;
    let hospitalsWithBeds = 0;

    hospitalsData.forEach((hospital) => {
      const bedAvailability = getBedAvailability(hospital);
      const hospitalAvailableBeds = Object.values(bedAvailability).reduce(
        (sum, bed) => sum + (bed.available || 0),
        0,
      );

      if (hospitalAvailableBeds > 0) {
        hospitalsWithBeds++;
        totalAvailableBeds += hospitalAvailableBeds;
      }
    });

    setStats({
      totalHospitals: hospitalsData.length,
      totalAvailableBeds,
      hospitalsWithBeds,
    });
  };

  const getBedTypes = () => [
    { key: "general", label: "General Bed", icon: "🛏️", color: "blue" },
    { key: "icu", label: "ICU Bed", icon: "💊", color: "red" },
    { key: "ventilator", label: "Ventilator Bed", icon: "🌬️", color: "green" },
    {
      key: "pediatricICU",
      label: "Pediatric ICU",
      icon: "👶",
      color: "purple",
    },
  ];

  // Commented out - bed reservation feature not currently in use
  // const reserveBed = async (hospitalId, bedType) => {
  //   if (!user) {
  //     alert("Please login to reserve a bed");
  //     navigate("/login");
  //     return;
  //   }

  //   if (!confirm(`Reserve a ${bedType} bed at this hospital?`)) return;

  //   try {
  //     const response = await axios.post(
  //       "/hospitals/reserve-bed",
  //       {
  //         hospitalId,
  //         bedType,
  //         durationMinutes: 30,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       alert(
  //         "✅ Bed reserved successfully! You have 30 minutes to reach the hospital."
  //       );
  //       fetchAllHospitals(); // Refresh data
  //     }
  //   } catch (error) {
  //     console.error("Error reserving bed:", error);
  //     alert(error.response?.data?.message || "Failed to reserve bed");
  //   }
  // };

  const getBedColor = (available, total) => {
    if (available === 0) return "red";
    if (available / total < 0.2) return "yellow";
    return "green";
  };

  // Get search examples for placeholder
  const getSearchExamples = () => {
    const examples = [
      "Manglore",
      "Bangalore, Karnataka",
      "Karnataka",
      "Delhi",
      "Mumbai, Maharashtra",
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  };

  // Check if there are active filters
  const hasActiveFilters = searchCity || bedType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 rounded-2xl shadow-xl mb-4 sm:mb-6 animate-pulse">
            <span className="text-2xl sm:text-3xl text-white">🏥</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Hospital Services
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
            Find hospitals with real-time bed availability and reserve beds
            instantly
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-2">
                  Total Hospitals
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalHospitals}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {hasActiveFilters ? "Matching filters" : "In system"}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🏥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-2">
                  Available Beds
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalAvailableBeds}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Ready for patients</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🛏️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold mb-2">
                  Hospitals with Beds
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.hospitalsWithBeds}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Have availability</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Find Hospital Beds
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Search by city, state, or full location - we'll find the best
                matches
              </p>
            </div>
            {user && (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
              >
                Logout
              </button>
            )}
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                📍 Search by Location
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder={`e.g., ${getSearchExamples()}`}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                Try: City name, State, or both (e.g., "Manglore, Karnataka")
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                🛏️ Bed Type
              </label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Bed Types</option>
                <option value="general">General Beds</option>
                <option value="icu">ICU Beds</option>
                <option value="ventilator">Ventilator Beds</option>
                <option value="pediatricICU">Pediatric ICU</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Searching...</span>
                  </div>
                ) : (
                  <>
                    <span className="hidden sm:inline">🔍 Search</span>
                    <span className="sm:hidden">🔍</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading || !hasActiveFilters}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
              >
                <span className="hidden sm:inline">🔄 Reset</span>
                <span className="sm:hidden">🔄</span>
              </button>
            </div>
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCity && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📍 Location: {searchCity}
                  <button
                    onClick={() => setSearchCity("")}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {bedType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🛏️ {bedType.charAt(0).toUpperCase() + bedType.slice(1)} Beds
                  <button
                    onClick={() => setBedType("")}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                📊 Showing {hospitals.length} of {allHospitals.length} hospitals
              </span>
            </div>
          )}

          {/* Search Tips */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center text-sm sm:text-base">
              💡 Search Tips
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs sm:text-sm text-blue-700">
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>City only: "Manglore"</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>City & State: "Bangalore, Karnataka"</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span>State only: "Karnataka"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hospitals Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters
                ? "No Hospitals Found"
                : "No Hospitals Available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? "No hospitals found matching your search criteria. Try different location or bed type."
                : "There are currently no hospitals in the system."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Show All Hospitals
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {hospitals.map((hospital) => {
              const bedAvailability = getBedAvailability(hospital);
              const totalAvailable = Object.values(bedAvailability).reduce(
                (sum, bed) => sum + (bed.available || 0),
                0,
              );

              return (
                <div
                  key={hospital._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                >
                  {/* Hospital Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          {hospital.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-blue-100">
                          <span>📍</span>
                          <span className="text-sm">
                            {hospital.city}, {hospital.state}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                          {totalAvailable} Beds
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Hospital Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <span className="text-lg">🏙️</span>
                        <span className="text-sm">{hospital.address}</span>
                      </div>
                      {hospital.phone && (
                        <div className="flex items-center space-x-3 text-gray-600">
                          <span className="text-lg">📞</span>
                          <span className="text-sm">{hospital.phone}</span>
                        </div>
                      )}
                      {hospital.email && (
                        <div className="flex items-center space-x-3 text-gray-600">
                          <span className="text-lg">📧</span>
                          <span className="text-sm">{hospital.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Bed Availability */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">
                        Bed Availability
                      </h4>
                      <div className="space-y-4">
                        {getBedTypes().map((bedTypeItem) => {
                          const bedData = bedAvailability[bedTypeItem.key];
                          const available = bedData?.available || 0;
                          const total = bedData?.total || 0;
                          const color = getBedColor(available, total);

                          return (
                            <div
                              key={bedTypeItem.key}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    color === "green"
                                      ? "bg-green-100"
                                      : color === "yellow"
                                        ? "bg-yellow-100"
                                        : "bg-red-100"
                                  }`}
                                >
                                  <span className="text-lg">
                                    {bedTypeItem.icon}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">
                                    {bedTypeItem.label}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {available} of {total} available
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                    color === "green"
                                      ? "bg-green-100 text-green-800"
                                      : color === "yellow"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {available > 0
                                    ? `${available} Available`
                                    : "Unavailable"}
                                </span>
                                {available > 0 && user && (
                                  // <button
                                  //   onClick={() =>
                                  //     reserveBed(hospital._id, bedTypeItem.key)
                                  //   }
                                  //   className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 block w-full"
                                  // >
                                  //   Reserve
                                  // </button>
                                  <></>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-6 flex space-x-3">
                        {hospital.phone && (
                          <button
                            onClick={() =>
                              window.open(`tel:${hospital.phone}`, "_self")
                            }
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                          >
                            📞 Call
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const getDirectionsUrl = (hospital) => {
                              // City to coordinates mapping
                              const cityCoordinates = {
                                manglore: "12.9141,74.8560",
                                bangalore: "12.9716,77.5946",
                                mumbai: "19.0760,72.8777",
                                delhi: "28.7041,77.1025",
                                chennai: "13.0827,80.2707",
                                kolkata: "22.5726,88.3639",
                                hyderabad: "17.3850,78.4867",
                                pune: "18.5204,73.8567",
                              };

                              const cityKey = hospital.city?.toLowerCase();
                              if (cityKey && cityCoordinates[cityKey]) {
                                return `https://maps.google.com/?q=${cityCoordinates[cityKey]}`;
                              }

                              // Fallback to address if no city match
                              return `https://maps.google.com/?q=${encodeURIComponent(
                                hospital.address || hospital.city || "",
                              )}`;
                            };

                            window.open(getDirectionsUrl(hospital), "_blank");
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                        >
                          🗺️ Directions
                        </button>
                      </div>

                      {!user && totalAvailable > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-sm text-center">
                            <button
                              onClick={() => navigate("/login")}
                              className="font-semibold underline hover:text-yellow-900"
                            >
                              Login
                            </button>{" "}
                            for more update
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospital;