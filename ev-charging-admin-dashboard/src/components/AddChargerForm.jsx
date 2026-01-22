import React, { useState, useCallback, memo, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar";
import { ChevronLeft, ChevronRight, CheckCircle, Copy } from "lucide-react";

const steps = [
  "Basic Info",
  "Hardware",
  "Location",
  "Usage & Owner",
];

// Memoized Input component outside the main component
const Input = memo(({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
  <div>
    <label className="text-sm text-gray-400">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
    />
  </div>
));

// Memoized SelectField component outside the main component
const SelectField = memo(({ label, name, value, onChange, options }) => (
  <div>
    <label className="text-sm text-gray-400">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

// Component display names for debugging
Input.displayName = "Input";
SelectField.displayName = "SelectField";

// State to short code mapping
const stateCodes = {
  "westbengal": "wb",
  "maharashtra": "mh",
  "delhi": "dl",
  "karnataka": "ka",
  "tamilnadu": "tn",
  "gujarat": "gj",
  "rajasthan": "rj",
  "uttarpradesh": "up",
  "andhrapradesh": "ap",
  "telangana": "ts",
  "kerala": "kl",
  "madhyapradesh": "mp",
  "punjab": "pb",
  "haryana": "hr",
  "jharkhand": "jh",
  "odisha": "od",
  "assam": "as",
  "bihar": "br",
  "chhattisgarh": "cg",
  "goa": "ga",
  "himachalpradesh": "hp",
  "jammuandkashmir": "jk",
  "uttarakhand": "uk",
};

// Function to decode JWT token and extract email
const decodeToken = (token) => {
  try {
    // JWT tokens have 3 parts: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Function to get user email from localStorage token
const getUserEmailFromToken = () => {
  try {
    // Try different possible token storage keys
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken', 'userToken'];
    
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          // Try to find email in different possible fields
          const email = decoded.email || decoded.Email || decoded.userEmail || decoded.user_email || decoded.username;
          if (email) {
            return email;
          }
        }
      }
    }
    
    // Also check for direct user info in localStorage
    const userInfoKeys = ['user', 'userInfo', 'currentUser', 'profile'];
    for (const key of userInfoKeys) {
      const userInfo = localStorage.getItem(key);
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          const email = parsed.email || parsed.Email;
          if (email) {
            return email;
          }
        } catch (e) {
          // Not JSON, continue
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user email from token:", error);
    return null;
  }
};

const AddChargerForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [ocppurl, setOcppurl] = useState("");
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    Chargerserialnum: "",
    ChargerName: "",
    Chargerhost: "",
    Segment: "",
    Subsegment: "",
    Total_Capacity: "",
    Chargertype: "",
    parking: "",
    number_of_connectors: "",
    Connector_type: "",
    connector_total_capacity: "",
    lattitude: "",
    longitute: "",
    full_address: "",
    charger_use_type: "",
    twenty_four_seven_open_status: "",
    charger_image: "",
    chargerbuyeremail: "", // Will be auto-filled from token
    chargeridentity: "",
    protocol: "",
  });

  const [locationDetails, setLocationDetails] = useState({
    state: "",
    areaCode: "",
    pincode: ""
  });

  // Get user email from token on component mount
  useEffect(() => {
    const email = getUserEmailFromToken();
    if (email) {
      setUserEmail(email);
      // Auto-fill the chargerbuyeremail in formData
      setFormData(prev => ({
        ...prev,
        chargerbuyeremail: email
      }));
    } else {
      console.warn("No user email found in localStorage token");
    }
  }, []);

  // Auto-generate charger identity when location details change
  useEffect(() => {
    if (locationDetails.state && locationDetails.areaCode && locationDetails.pincode) {
      const stateKey = locationDetails.state.toLowerCase().replace(/\s+/g, '');
      const stateCode = stateCodes[stateKey] || stateKey.slice(0, 2).toLowerCase();
      const areaCode = locationDetails.areaCode.toString().padStart(2, '0');
      const pincode = locationDetails.pincode.toString().replace(/\D/g, '').slice(0, 6);
      
      const generatedIdentity = `${stateCode}${areaCode}${pincode}`.toLowerCase();
      
      setFormData(prev => ({
        ...prev,
        chargeridentity: generatedIdentity
      }));
    }
  }, [locationDetails]);

  // Extract state and pincode from full address when entered
  useEffect(() => {
    if (formData.full_address) {
      const address = formData.full_address.toLowerCase();
      
      // Try to extract state from address
      let detectedState = "";
      for (const [stateName, stateCode] of Object.entries(stateCodes)) {
        if (address.includes(stateName)) {
          detectedState = stateName.charAt(0).toUpperCase() + stateName.slice(1);
          break;
        }
      }
      
      // Try to extract pincode (6-digit number)
      const pincodeMatch = formData.full_address.match(/\b\d{6}\b/);
      const detectedPincode = pincodeMatch ? pincodeMatch[0] : "";
      
      if (detectedState && !locationDetails.state) {
        setLocationDetails(prev => ({ ...prev, state: detectedState }));
      }
      
      if (detectedPincode && !locationDetails.pincode) {
        setLocationDetails(prev => ({ ...prev, pincode: detectedPincode }));
      }
    }
  }, [formData.full_address, locationDetails.state, locationDetails.pincode]);

  // Use useCallback for handleChange to prevent recreation on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocationDetails(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCopyIdentity = () => {
    navigator.clipboard.writeText(formData.chargeridentity);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      // Make sure we have the user email from token
      const emailFromToken = userEmail || getUserEmailFromToken();
      
      if (!emailFromToken) {
        setMessage("Error: Could not retrieve user email from authentication token. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      // Ensure chargerbuyeremail is set from token
      const payload = {
        ...formData,
        chargerbuyeremail: emailFromToken
      };
      
      console.log("Submitting payload:", payload);
      
      const res = await fetch(
        "https://be.cms.ocpp.transev.site/admin/createchargerunit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiauthkey: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Charger created successfully!");
        setOcppurl(data.ocppurl || "");
      } else {
        setMessage(data.message || "Failed to create charger");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("Server error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Define options for select fields
  const chargerTypeOptions = [
    { value: "DC Fast", label: "DC Fast Charger" },
    { value: "AC Level 2", label: "AC Level 2" },
    { value: "AC Level 1", label: "AC Level 1" },
    { value: "Tesla Supercharger", label: "Tesla Supercharger" }
  ];

  const parkingOptions = [
    { value: "Dedicated", label: "Dedicated Parking" },
    { value: "Shared", label: "Shared Parking" },
    { value: "Street", label: "Street Parking" },
    { value: "Garage", label: "Garage" }
  ];

  const connectorTypeOptions = [
    { value: "CCS", label: "CCS (Combined Charging System)" },
    { value: "CHAdeMO", label: "CHAdeMO" },
    { value: "Type 2", label: "Type 2 (Mennekes)" },
    { value: "GB/T", label: "GB/T" },
    { value: "Tesla", label: "Tesla Connector" }
  ];

  const chargerUseTypeOptions = [
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" },
    { value: "Fleet", label: "Fleet" },
    { value: "Workplace", label: "Workplace" }
  ];

  const openStatusOptions = [
    { value: "yes", label: "24/7 Open" },
    { value: "no", label: "Limited Hours" }
  ];

  const protocolOptions = [
    { value: "OCPP1.6", label: "OCPP 1.6" },
    { value: "OCPP2.0", label: "OCPP 2.0" },
    { value: "OCPP1.5", label: "OCPP 1.5" },
    { value: "ISO15118", label: "ISO 15118" }
  ];

  const stateOptions = Object.entries(stateCodes).map(([stateName, code]) => ({
    value: stateName.charAt(0).toUpperCase() + stateName.slice(1),
    label: `${stateName.charAt(0).toUpperCase() + stateName.slice(1)} (${code.toUpperCase()})`
  }));

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* PAGE HEADER */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT */}
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Add Charger Unit
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Register and configure a new EV charger
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span>
                  Step <strong className="text-white">{currentStep}</strong> of{" "}
                  <strong className="text-white">{steps.length}</strong>
                </span>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>{steps[currentStep - 1]}</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="text-sm text-gray-400">
              {userEmail ? (
                <span className="text-green-400">Logged in as: {userEmail}</span>
              ) : (
                "Required fields only • OCPP enabled"
              )}
            </div>
          </div>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex gap-4">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                ${
                  currentStep === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-400"
                }`}
            >
              {currentStep > i + 1 ? (
                <CheckCircle size={16} />
              ) : (
                <span className="font-bold">{i + 1}</span>
              )}
              {step}
            </div>
          ))}
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-6"
        >
          {/* STEP 1 - Basic Info (5 fields) */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Charger Serial Number" 
                name="Chargerserialnum" 
                value={formData.Chargerserialnum}
                onChange={handleChange}
                placeholder="CHG-0001" 
              />
              <Input 
                label="Charger Name" 
                name="ChargerName" 
                value={formData.ChargerName}
                onChange={handleChange}
                placeholder="Main Station Charger" 
              />
              <Input 
                label="Charger Host" 
                name="Chargerhost" 
                value={formData.Chargerhost}
                onChange={handleChange}
                placeholder="Company Name" 
              />
              <Input 
                label="Segment" 
                name="Segment" 
                value={formData.Segment}
                onChange={handleChange}
                placeholder="Commercial/Residential" 
              />
              <Input 
                label="Subsegment" 
                name="Subsegment" 
                value={formData.Subsegment}
                onChange={handleChange}
                placeholder="Mall/Office/Home" 
              />
            </div>
          )}

          {/* STEP 2 - Hardware (6 fields) */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Total Capacity (kW)" 
                name="Total_Capacity" 
                type="number" 
                value={formData.Total_Capacity}
                onChange={handleChange}
                placeholder="150" 
              />
              <SelectField 
                label="Charger Type" 
                name="Chargertype"
                value={formData.Chargertype}
                onChange={handleChange}
                options={chargerTypeOptions}
              />
              <SelectField 
                label="Parking Type" 
                name="parking"
                value={formData.parking}
                onChange={handleChange}
                options={parkingOptions}
              />
              <Input 
                label="Number of Connectors" 
                name="number_of_connectors" 
                type="number" 
                value={formData.number_of_connectors}
                onChange={handleChange}
                placeholder="2" 
              />
              <SelectField 
                label="Connector Type" 
                name="Connector_type"
                value={formData.Connector_type}
                onChange={handleChange}
                options={connectorTypeOptions}
              />
              <Input 
                label="Connector Capacity (kW)" 
                name="connector_total_capacity" 
                type="number" 
                value={formData.connector_total_capacity}
                onChange={handleChange}
                placeholder="75" 
              />
            </div>
          )}

          {/* STEP 3 - Location (6 fields) */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Latitude" 
                name="lattitude" 
                type="number" 
                step="any" 
                value={formData.lattitude}
                onChange={handleChange}
                placeholder="40.7128" 
              />
              <Input 
                label="Longitude" 
                name="longitute" 
                type="number" 
                step="any" 
                value={formData.longitute}
                onChange={handleChange}
                placeholder="-74.0060" 
              />
              <div className="md:col-span-2">
                <Input 
                  label="Full Address" 
                  name="full_address" 
                  value={formData.full_address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, State, Pincode" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include state and pincode for auto-detection
                </p>
              </div>
              
              <SelectField 
                label="State" 
                name="state"
                value={locationDetails.state}
                onChange={handleLocationChange}
                options={stateOptions}
              />
              
              <Input 
                label="Area Code (2 digits)" 
                name="areaCode" 
                type="text" 
                value={locationDetails.areaCode}
                onChange={handleLocationChange}
                placeholder="01, 02, etc."
                pattern="[0-9]{2}"
                maxLength={2}
              />
              
              <Input 
                label="Pincode (6 digits)" 
                name="pincode" 
                type="text" 
                value={locationDetails.pincode}
                onChange={handleLocationChange}
                placeholder="700001"
                pattern="[0-9]{6}"
                maxLength={6}
              />
              
              <div className="md:col-span-2 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Generated Charger Identity:</span>
                  <button
                    type="button"
                    onClick={handleCopyIdentity}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Copy size={14} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="text-lg font-mono font-bold text-white bg-black/30 p-3 rounded-lg">
                  {formData.chargeridentity || "Enter state, area code and pincode"}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Format: State Code (ex: wb) + Area Code (2 digits) + Pincode
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 - Usage & Owner (7 fields) */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                label="Charger Use Type" 
                name="charger_use_type"
                value={formData.charger_use_type}
                onChange={handleChange}
                options={chargerUseTypeOptions}
              />
              <SelectField 
                label="24/7 Open Status" 
                name="twenty_four_seven_open_status"
                value={formData.twenty_four_seven_open_status}
                onChange={handleChange}
                options={openStatusOptions}
              />
              <Input 
                label="Charger Image URL" 
                name="charger_image" 
                value={formData.charger_image}
                onChange={handleChange}
                placeholder="https://example.com/charger.jpg" 
              />
              
              {/* Auto-filled from token - Read Only */}
              <div>
                <label className="text-sm text-gray-400">Charger Buyer Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="email"
                    value={formData.chargerbuyeremail}
                    readOnly
                    className="w-full bg-[#111827] border border-green-500/30 rounded-xl px-4 py-2 cursor-not-allowed opacity-80"
                  />
                  <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded whitespace-nowrap">
                    From Token
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled from your authentication token
                </p>
              </div>
              
              {/* Auto-generated Charger Identity - Read Only */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-400">Charger Identity (Auto-generated)</label>
                  <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">✓ Auto-filled</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    label=""
                    name="chargeridentity"
                    value={formData.chargeridentity}
                    onChange={handleChange}
                    placeholder="Charger identity will be auto-generated"
                    readOnly={true}
                  />
                  <button
                    type="button"
                    onClick={handleCopyIdentity}
                    className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                  >
                    <Copy size={16} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Generated from: {locationDetails.state ? `${locationDetails.state} (${stateCodes[locationDetails.state.toLowerCase().replace(/\s+/g, '')] || '??'})` : 'State'} + {locationDetails.areaCode || 'Area'} + {locationDetails.pincode || 'Pincode'}
                </p>
              </div>
              
              <SelectField 
                label="Protocol" 
                name="protocol"
                value={formData.protocol}
                onChange={handleChange}
                options={protocolOptions}
              />
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                disabled={isLoading}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2 justify-center min-w-[140px]"
                disabled={isLoading || !userEmail}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Charger"
                )}
              </button>
            )}
          </div>
          
          {/* User email status */}
          {!userEmail && currentStep === 4 && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">
                ⚠️ Unable to retrieve your email from authentication token. The charger buyer email will be empty.
                Please ensure you are logged in properly.
              </p>
            </div>
          )}
        </form>

        {/* RESPONSE MESSAGE */}
        {message && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className={ocppurl ? "text-green-400" : "text-red-400"}>
              {message}
            </p>
            {ocppurl && (
              <p className="text-blue-400 mt-1">
                OCPP URL: <span className="font-mono text-sm">{ocppurl}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddChargerForm;