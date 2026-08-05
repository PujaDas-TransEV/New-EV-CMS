// import React, { useState, useCallback, memo, useEffect } from "react";
// import Sidebar from "../Sidebar/Sidebar";
// import { ChevronLeft, ChevronRight, CheckCircle, Copy } from "lucide-react";

// const steps = [
//   "Basic Info",
//   "Hardware",
//   "Location",
//   "Usage & Owner",
// ];

// // Memoized Input component outside the main component
// const Input = memo(({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
//   <div>
//     <label className="text-sm text-gray-400">{label}</label>
//     <input
//       type={type}
//       name={name}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       readOnly={readOnly}
//       className={`mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
//     />
//   </div>
// ));

// // Memoized SelectField component outside the main component
// const SelectField = memo(({ label, name, value, onChange, options }) => (
//   <div>
//     <label className="text-sm text-gray-400">{label}</label>
//     <select
//       name={name}
//       value={value}
//       onChange={onChange}
//       className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//     >
//       <option value="">Select {label}</option>
//       {options.map((option) => (
//         <option key={option.value} value={option.value}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   </div>
// ));

// // Component display names for debugging
// Input.displayName = "Input";
// SelectField.displayName = "SelectField";

// // State to short code mapping
// const stateCodes = {
//   "westbengal": "wb",
//   "maharashtra": "mh",
//   "delhi": "dl",
//   "karnataka": "ka",
//   "tamilnadu": "tn",
//   "gujarat": "gj",
//   "rajasthan": "rj",
//   "uttarpradesh": "up",
//   "andhrapradesh": "ap",
//   "telangana": "ts",
//   "kerala": "kl",
//   "madhyapradesh": "mp",
//   "punjab": "pb",
//   "haryana": "hr",
//   "jharkhand": "jh",
//   "odisha": "od",
//   "assam": "as",
//   "bihar": "br",
//   "chhattisgarh": "cg",
//   "goa": "ga",
//   "himachalpradesh": "hp",
//   "jammuandkashmir": "jk",
//   "uttarakhand": "uk",
// };

// // Function to decode JWT token and extract email
// const decodeToken = (token) => {
//   try {
//     // JWT tokens have 3 parts: header.payload.signature
//     const base64Url = token.split('.')[1];
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
    
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error("Failed to decode token:", error);
//     return null;
//   }
// };

// // Function to get user email from localStorage token
// const getUserEmailFromToken = () => {
//   try {
//     // Try different possible token storage keys
//     const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken', 'userToken'];
    
//     for (const key of tokenKeys) {
//       const token = localStorage.getItem(key);
//       if (token) {
//         const decoded = decodeToken(token);
//         if (decoded) {
//           // Try to find email in different possible fields
//           const email = decoded.email || decoded.Email || decoded.userEmail || decoded.user_email || decoded.username;
//           if (email) {
//             return email;
//           }
//         }
//       }
//     }
    
//     // Also check for direct user info in localStorage
//     const userInfoKeys = ['user', 'userInfo', 'currentUser', 'profile'];
//     for (const key of userInfoKeys) {
//       const userInfo = localStorage.getItem(key);
//       if (userInfo) {
//         try {
//           const parsed = JSON.parse(userInfo);
//           const email = parsed.email || parsed.Email;
//           if (email) {
//             return email;
//           }
//         } catch (e) {
//           // Not JSON, continue
//         }
//       }
//     }
    
//     return null;
//   } catch (error) {
//     console.error("Error getting user email from token:", error);
//     return null;
//   }
// };

// const AddChargerForm = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [message, setMessage] = useState("");
//   const [ocppurl, setOcppurl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [userEmail, setUserEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     Chargerserialnum: "",
//     ChargerName: "",
//     Chargerhost: "",
//     Segment: "",
//     Subsegment: "",
//     Total_Capacity: "",
//     Chargertype: "",
//     parking: "",
//     number_of_connectors: "",
//     Connector_type: "",
//     connector_total_capacity: "",
//     lattitude: "",
//     longitute: "",
//     full_address: "",
//     charger_use_type: "",
//     twenty_four_seven_open_status: "",
//     charger_image: "",
//     chargerbuyeremail: "", // Will be auto-filled from token
//     chargeridentity: "",
//     protocol: "",
//   });

//   const [locationDetails, setLocationDetails] = useState({
//     state: "",
//     areaCode: "",
//     pincode: ""
//   });

//   // Get user email from token on component mount
//   useEffect(() => {
//     const email = getUserEmailFromToken();
//     if (email) {
//       setUserEmail(email);
//       // Auto-fill the chargerbuyeremail in formData
//       setFormData(prev => ({
//         ...prev,
//         chargerbuyeremail: email
//       }));
//     } else {
//       console.warn("No user email found in localStorage token");
//     }
//   }, []);

//   // Auto-generate charger identity when location details change
//   useEffect(() => {
//     if (locationDetails.state && locationDetails.areaCode && locationDetails.pincode) {
//       const stateKey = locationDetails.state.toLowerCase().replace(/\s+/g, '');
//       const stateCode = stateCodes[stateKey] || stateKey.slice(0, 2).toLowerCase();
//       const areaCode = locationDetails.areaCode.toString().padStart(2, '0');
//       const pincode = locationDetails.pincode.toString().replace(/\D/g, '').slice(0, 6);
      
//       const generatedIdentity = `${stateCode}${areaCode}${pincode}`.toLowerCase();
      
//       setFormData(prev => ({
//         ...prev,
//         chargeridentity: generatedIdentity
//       }));
//     }
//   }, [locationDetails]);

//   // Extract state and pincode from full address when entered
//   useEffect(() => {
//     if (formData.full_address) {
//       const address = formData.full_address.toLowerCase();
      
//       // Try to extract state from address
//       let detectedState = "";
//       for (const [stateName, stateCode] of Object.entries(stateCodes)) {
//         if (address.includes(stateName)) {
//           detectedState = stateName.charAt(0).toUpperCase() + stateName.slice(1);
//           break;
//         }
//       }
      
//       // Try to extract pincode (6-digit number)
//       const pincodeMatch = formData.full_address.match(/\b\d{6}\b/);
//       const detectedPincode = pincodeMatch ? pincodeMatch[0] : "";
      
//       if (detectedState && !locationDetails.state) {
//         setLocationDetails(prev => ({ ...prev, state: detectedState }));
//       }
      
//       if (detectedPincode && !locationDetails.pincode) {
//         setLocationDetails(prev => ({ ...prev, pincode: detectedPincode }));
//       }
//     }
//   }, [formData.full_address, locationDetails.state, locationDetails.pincode]);

//   // Use useCallback for handleChange to prevent recreation on every render
//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   }, []);

//   const handleLocationChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setLocationDetails(prev => ({ ...prev, [name]: value }));
//   }, []);

//   const handleCopyIdentity = () => {
//     navigator.clipboard.writeText(formData.chargeridentity);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage("");
    
//     try {
//       // Make sure we have the user email from token
//       const emailFromToken = userEmail || getUserEmailFromToken();
      
//       if (!emailFromToken) {
//         setMessage("Error: Could not retrieve user email from authentication token. Please log in again.");
//         setIsLoading(false);
//         return;
//       }
      
//       // Ensure chargerbuyeremail is set from token
//       const payload = {
//         ...formData,
//         chargerbuyeremail: emailFromToken
//       };
      
//       console.log("Submitting payload:", payload);
      
//       const res = await fetch(
//         "https://be.cms.ocpp.transev.site/admin/createchargerunit",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             apiauthkey: "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const data = await res.json();
//       if (res.ok) {
//         setMessage(data.message || "Charger created successfully!");
//         setOcppurl(data.ocppurl || "");
//       } else {
//         setMessage(data.message || "Failed to create charger");
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       setMessage("Server error. Try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Define options for select fields
//   const chargerTypeOptions = [
//     { value: "DC Fast", label: "DC Fast Charger" },
//     { value: "AC Level 2", label: "AC Level 2" },
//     { value: "AC Level 1", label: "AC Level 1" },
//     { value: "Tesla Supercharger", label: "Tesla Supercharger" }
//   ];

//   const parkingOptions = [
//     { value: "Dedicated", label: "Dedicated Parking" },
//     { value: "Shared", label: "Shared Parking" },
//     { value: "Street", label: "Street Parking" },
//     { value: "Garage", label: "Garage" }
//   ];

//   const connectorTypeOptions = [
//     { value: "CCS", label: "CCS (Combined Charging System)" },
//     { value: "CHAdeMO", label: "CHAdeMO" },
//     { value: "Type 2", label: "Type 2 (Mennekes)" },
//     { value: "GB/T", label: "GB/T" },
//     { value: "Tesla", label: "Tesla Connector" }
//   ];

//   const chargerUseTypeOptions = [
//     { value: "Public", label: "Public" },
//     { value: "Private", label: "Private" },
//     { value: "Fleet", label: "Fleet" },
//     { value: "Workplace", label: "Workplace" }
//   ];

//   const openStatusOptions = [
//     { value: "yes", label: "24/7 Open" },
//     { value: "no", label: "Limited Hours" }
//   ];

//   const protocolOptions = [
//     { value: "OCPP1.6", label: "OCPP 1.6" },
//     { value: "OCPP2.0", label: "OCPP 2.0" },
//     { value: "OCPP1.5", label: "OCPP 1.5" },
//     { value: "ISO15118", label: "ISO 15118" }
//   ];

//   const stateOptions = Object.entries(stateCodes).map(([stateName, code]) => ({
//     value: stateName.charAt(0).toUpperCase() + stateName.slice(1),
//     label: `${stateName.charAt(0).toUpperCase() + stateName.slice(1)} (${code.toUpperCase()})`
//   }));

//   return (
//     <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
//       <Sidebar />

//       <div className="flex-1 p-6 space-y-6">
//         {/* PAGE HEADER */}
//         <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             {/* LEFT */}
//             <div>
//               <h1 className="text-2xl font-semibold text-white">
//                 Add Charger Unit
//               </h1>
//               <p className="text-sm text-gray-400 mt-1">
//                 Register and configure a new EV charger
//               </p>
//               <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
//                 <span>
//                   Step <strong className="text-white">{currentStep}</strong> of{" "}
//                   <strong className="text-white">{steps.length}</strong>
//                 </span>
//                 <span className="w-1 h-1 bg-gray-500 rounded-full" />
//                 <span>{steps[currentStep - 1]}</span>
//               </div>
//             </div>

//             {/* RIGHT */}
//             <div className="text-sm text-gray-400">
//               {userEmail ? (
//                 <span className="text-green-400">Logged in as: {userEmail}</span>
//               ) : (
//                 "Required fields only • OCPP enabled"
//               )}
//             </div>
//           </div>
//         </div>

//         {/* STEP INDICATOR */}
//         <div className="flex gap-4">
//           {steps.map((step, i) => (
//             <div
//               key={step}
//               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
//                 ${
//                   currentStep === i + 1
//                     ? "bg-blue-600 text-white"
//                     : "bg-white/5 border border-white/10 text-gray-400"
//                 }`}
//             >
//               {currentStep > i + 1 ? (
//                 <CheckCircle size={16} />
//               ) : (
//                 <span className="font-bold">{i + 1}</span>
//               )}
//               {step}
//             </div>
//           ))}
//         </div>

//         {/* FORM CARD */}
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-6"
//         >
//           {/* STEP 1 - Basic Info (5 fields) */}
//           {currentStep === 1 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input 
//                 label="Charger Serial Number" 
//                 name="Chargerserialnum" 
//                 value={formData.Chargerserialnum}
//                 onChange={handleChange}
//                 placeholder="CHG-0001" 
//               />
//               <Input 
//                 label="Charger Name" 
//                 name="ChargerName" 
//                 value={formData.ChargerName}
//                 onChange={handleChange}
//                 placeholder="Main Station Charger" 
//               />
//               <Input 
//                 label="Charger Host" 
//                 name="Chargerhost" 
//                 value={formData.Chargerhost}
//                 onChange={handleChange}
//                 placeholder="Company Name" 
//               />
//               <Input 
//                 label="Segment" 
//                 name="Segment" 
//                 value={formData.Segment}
//                 onChange={handleChange}
//                 placeholder="Commercial/Residential" 
//               />
//               <Input 
//                 label="Subsegment" 
//                 name="Subsegment" 
//                 value={formData.Subsegment}
//                 onChange={handleChange}
//                 placeholder="Mall/Office/Home" 
//               />
//             </div>
//           )}

//           {/* STEP 2 - Hardware (6 fields) */}
//           {currentStep === 2 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input 
//                 label="Total Capacity (kW)" 
//                 name="Total_Capacity" 
//                 type="number" 
//                 value={formData.Total_Capacity}
//                 onChange={handleChange}
//                 placeholder="150" 
//               />
//               <SelectField 
//                 label="Charger Type" 
//                 name="Chargertype"
//                 value={formData.Chargertype}
//                 onChange={handleChange}
//                 options={chargerTypeOptions}
//               />
//               <SelectField 
//                 label="Parking Type" 
//                 name="parking"
//                 value={formData.parking}
//                 onChange={handleChange}
//                 options={parkingOptions}
//               />
//               <Input 
//                 label="Number of Connectors" 
//                 name="number_of_connectors" 
//                 type="number" 
//                 value={formData.number_of_connectors}
//                 onChange={handleChange}
//                 placeholder="2" 
//               />
//               <SelectField 
//                 label="Connector Type" 
//                 name="Connector_type"
//                 value={formData.Connector_type}
//                 onChange={handleChange}
//                 options={connectorTypeOptions}
//               />
//               <Input 
//                 label="Connector Capacity (kW)" 
//                 name="connector_total_capacity" 
//                 type="number" 
//                 value={formData.connector_total_capacity}
//                 onChange={handleChange}
//                 placeholder="75" 
//               />
//             </div>
//           )}

//           {/* STEP 3 - Location (6 fields) */}
//           {currentStep === 3 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Input 
//                 label="Latitude" 
//                 name="lattitude" 
//                 type="number" 
//                 step="any" 
//                 value={formData.lattitude}
//                 onChange={handleChange}
//                 placeholder="40.7128" 
//               />
//               <Input 
//                 label="Longitude" 
//                 name="longitute" 
//                 type="number" 
//                 step="any" 
//                 value={formData.longitute}
//                 onChange={handleChange}
//                 placeholder="-74.0060" 
//               />
//               <div className="md:col-span-2">
//                 <Input 
//                   label="Full Address" 
//                   name="full_address" 
//                   value={formData.full_address}
//                   onChange={handleChange}
//                   placeholder="123 Main St, City, State, Pincode" 
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Include state and pincode for auto-detection
//                 </p>
//               </div>
              
//               <SelectField 
//                 label="State" 
//                 name="state"
//                 value={locationDetails.state}
//                 onChange={handleLocationChange}
//                 options={stateOptions}
//               />
              
//               <Input 
//                 label="Area Code (2 digits)" 
//                 name="areaCode" 
//                 type="text" 
//                 value={locationDetails.areaCode}
//                 onChange={handleLocationChange}
//                 placeholder="01, 02, etc."
//                 pattern="[0-9]{2}"
//                 maxLength={2}
//               />
              
//               <Input 
//                 label="Pincode (6 digits)" 
//                 name="pincode" 
//                 type="text" 
//                 value={locationDetails.pincode}
//                 onChange={handleLocationChange}
//                 placeholder="700001"
//                 pattern="[0-9]{6}"
//                 maxLength={6}
//               />
              
//               <div className="md:col-span-2 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-gray-300">Generated Charger Identity:</span>
//                   <button
//                     type="button"
//                     onClick={handleCopyIdentity}
//                     className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
//                   >
//                     <Copy size={14} />
//                     {copied ? "Copied!" : "Copy"}
//                   </button>
//                 </div>
//                 <div className="text-lg font-mono font-bold text-white bg-black/30 p-3 rounded-lg">
//                   {formData.chargeridentity || "Enter state, area code and pincode"}
//                 </div>
//                 <p className="text-xs text-gray-400 mt-2">
//                   Format: State Code (ex: wb) + Area Code (2 digits) + Pincode
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* STEP 4 - Usage & Owner (7 fields) */}
//           {currentStep === 4 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <SelectField 
//                 label="Charger Use Type" 
//                 name="charger_use_type"
//                 value={formData.charger_use_type}
//                 onChange={handleChange}
//                 options={chargerUseTypeOptions}
//               />
//               <SelectField 
//                 label="24/7 Open Status" 
//                 name="twenty_four_seven_open_status"
//                 value={formData.twenty_four_seven_open_status}
//                 onChange={handleChange}
//                 options={openStatusOptions}
//               />
//               <Input 
//                 label="Charger Image URL" 
//                 name="charger_image" 
//                 value={formData.charger_image}
//                 onChange={handleChange}
//                 placeholder="https://example.com/charger.jpg" 
//               />
              
//               {/* Auto-filled from token - Read Only */}
//               <div>
//                 <label className="text-sm text-gray-400">Charger Buyer Email</label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <input
//                     type="email"
//                     value={formData.chargerbuyeremail}
//                     readOnly
//                     className="w-full bg-[#111827] border border-green-500/30 rounded-xl px-4 py-2 cursor-not-allowed opacity-80"
//                   />
//                   <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded whitespace-nowrap">
//                     From Token
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Auto-filled from your authentication token
//                 </p>
//               </div>
              
//               {/* Auto-generated Charger Identity - Read Only */}
//               <div className="md:col-span-2">
//                 <div className="flex items-center justify-between mb-1">
//                   <label className="text-sm text-gray-400">Charger Identity (Auto-generated)</label>
//                   <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">✓ Auto-filled</span>
//                 </div>
//                 <div className="flex gap-2">
//                   <Input 
//                     label=""
//                     name="chargeridentity"
//                     value={formData.chargeridentity}
//                     onChange={handleChange}
//                     placeholder="Charger identity will be auto-generated"
//                     readOnly={true}
//                   />
//                   <button
//                     type="button"
//                     onClick={handleCopyIdentity}
//                     className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
//                   >
//                     <Copy size={16} />
//                     {copied ? "Copied!" : "Copy"}
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Generated from: {locationDetails.state ? `${locationDetails.state} (${stateCodes[locationDetails.state.toLowerCase().replace(/\s+/g, '')] || '??'})` : 'State'} + {locationDetails.areaCode || 'Area'} + {locationDetails.pincode || 'Pincode'}
//                 </p>
//               </div>
              
//               <SelectField 
//                 label="Protocol" 
//                 name="protocol"
//                 value={formData.protocol}
//                 onChange={handleChange}
//                 options={protocolOptions}
//               />
//             </div>
//           )}

//           {/* NAV BUTTONS */}
//           <div className="flex justify-between pt-4">
//             {currentStep > 1 ? (
//               <button
//                 type="button"
//                 onClick={() => setCurrentStep(currentStep - 1)}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
//                 disabled={isLoading}
//               >
//                 <ChevronLeft size={16} />
//                 Previous
//               </button>
//             ) : (
//               <div />
//             )}

//             {currentStep < 4 ? (
//               <button
//                 type="button"
//                 onClick={() => setCurrentStep(currentStep + 1)}
//                 className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
//                 disabled={isLoading}
//               >
//                 Next
//                 <ChevronRight size={16} />
//               </button>
//             ) : (
//               <button
//                 type="submit"
//                 className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2 justify-center min-w-[140px]"
//                 disabled={isLoading || !userEmail}
//               >
//                 {isLoading ? (
//                   <>
//                     <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Charger"
//                 )}
//               </button>
//             )}
//           </div>
          
//           {/* User email status */}
//           {!userEmail && currentStep === 4 && (
//             <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
//               <p className="text-red-400 text-sm">
//                 ⚠️ Unable to retrieve your email from authentication token. The charger buyer email will be empty.
//                 Please ensure you are logged in properly.
//               </p>
//             </div>
//           )}
//         </form>

//         {/* RESPONSE MESSAGE */}
//         {message && (
//           <div className="bg-white/5 border border-white/10 rounded-xl p-4">
//             <p className={ocppurl ? "text-green-400" : "text-red-400"}>
//               {message}
//             </p>
//             {ocppurl && (
//               <p className="text-blue-400 mt-1">
//                 OCPP URL: <span className="font-mono text-sm">{ocppurl}</span>
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddChargerForm;

import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Copy, 
  Settings, 
  Plus, 
  ChevronDown, 
  LogOut, 
  User, 
  Building, 
  Phone, 
  MapPin, 
  Zap, 
  Loader2,
  AlertCircle,
  Check,
  X,
  Shield,
  Clock,
  Calendar,
  Mail,
  Upload,
  Image
} from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  CHARGERS_API: `${API_BASE_URL}/api/v1/cpo/chargers`,
  REFRESH_TOKEN_API: `${API_BASE_URL}/api/v1/auth/refresh`,
  LOGOUT_API: `${API_BASE_URL}/api/v1/auth/logout`,
  USER_INFO_API: `${API_BASE_URL}/api/v1/auth/me`
};

// Token Refresh Functions
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    console.log('No refresh token found');
    return { success: false, error: 'No refresh token available' };
  }

  try {
    const response = await fetch(API_CONFIG.REFRESH_TOKEN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CPO-App-ID': CPO_APP_ID
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json();
    console.log('Refresh token response:', data);

    if (response.ok && data.access_token) {
      localStorage.setItem('token', data.access_token);
      
      if (data.expires_in) {
        localStorage.setItem('token_expiry', Date.now() + (data.expires_in * 1000));
      }
      
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return { success: true, token: data.access_token };
    } else {
      console.log('Refresh token failed:', data);
      return { success: false, error: data.message || 'Failed to refresh token' };
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: error.message };
  }
};

const fetchWithTokenRefresh = async (url, options = {}, retryCount = 2) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  console.log('Fetching URL:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'X-CPO-App-ID': CPO_APP_ID,
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 401 && retryCount > 0) {
      console.log(`Received 401, attempting token refresh (${retryCount} retries left)...`);
      
      const refreshResult = await refreshAccessToken();
      
      if (refreshResult.success) {
        const newToken = localStorage.getItem('token');
        console.log('Token refreshed successfully, retrying request...');
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json',
          }
        });
        
        if (retryResponse.ok) {
          return retryResponse;
        } else if (retryResponse.status === 401 && retryCount > 1) {
          return fetchWithTokenRefresh(url, options, retryCount - 1);
        }
      } else {
        console.log('Refresh token failed, redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('userInfo');
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const steps = [
  "Basic Info",
  "Hardware",
  "Usage & Owner",
];

// Memoized Input component - Made larger
const Input = memo(({ label, name, value, onChange, type = "text", placeholder = "", readOnly = false, required = false }) => (
  <div>
    <label className="text-base text-gray-700 font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      className={`mt-1.5 w-full bg-gray-50 border border-gray-300 rounded-xl px-5 py-3.5 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition ${
        readOnly ? 'cursor-not-allowed opacity-80 bg-gray-100' : 'hover:border-gray-400'
      }`}
    />
  </div>
));

// Memoized SelectField component - Made larger
const SelectField = memo(({ label, name, value, onChange, options, required = false }) => (
  <div>
    <label className="text-base text-gray-700 font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1.5 w-full bg-gray-50 border border-gray-300 rounded-xl px-5 py-3.5 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition hover:border-gray-400"
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

// File upload component
const FileUpload = memo(({ label, name, value, onChange, required = false }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange({
          target: {
            name: name,
            value: reader.result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="text-base text-gray-700 font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1.5">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition border-gray-300 hover:border-blue-400">
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-xl p-2" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    onChange({ target: { name: name, value: "" } });
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {value && !preview && (
          <p className="mt-2 text-sm text-green-600">Image uploaded successfully</p>
        )}
      </div>
    </div>
  );
});

// Component display names
Input.displayName = "Input";
SelectField.displayName = "SelectField";
FileUpload.displayName = "FileUpload";

// Segment options
const segmentOptions = [
  { value: "Commercial", label: "Commercial" },
  { value: "Residential", label: "Residential" },
  { value: "Industrial", label: "Industrial" },
  { value: "Public", label: "Public" },
  { value: "Fleet", label: "Fleet" }
];

const subsegmentOptions = [
  { value: "Mall", label: "Mall" },
  { value: "Office", label: "Office" },
  { value: "Home", label: "Home" },
  { value: "Hotel", label: "Hotel" },
  { value: "Restaurant", label: "Restaurant" },
  { value: "Hospital", label: "Hospital" },
  { value: "Parking Lot", label: "Parking Lot" },
  { value: "Highway", label: "Highway" }
];

// Decode JWT token
const decodeToken = (token) => {
  try {
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

// Get user email from token
const getUserEmailFromToken = () => {
  try {
    const tokenKeys = ['token', 'authToken', 'accessToken', 'jwtToken', 'userToken'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          const email = decoded.email || decoded.Email || decoded.userEmail || decoded.user_email || decoded.username;
          if (email) return email;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting user email:", error);
    return null;
  }
};

const AddChargerForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdCharger, setCreatedCharger] = useState(null);
  
  // Settings menu state
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    Chargerserialnum: "",
    ChargerName: "",
    Chargerhost: "",
    host_phone: "",
    Segment: "",
    Subsegment: "",
    Total_Capacity: "",
    Chargertype: "",
    parking: "",
    number_of_connectors: "",
    Connector_type: "",
    connector_total_capacity: "",
    charger_use_type: "",
    twenty_four_seven_open_status: "",
    charger_image: "",
    chargerbuyeremail: "",
    chargeridentity: "",
    protocol: "",
  });

  // Get user info on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchUserInfo();
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchWithTokenRefresh(API_CONFIG.USER_INFO_API, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        const email = data.user?.email || '';
        setUserEmail(email);
        setFormData(prev => ({
          ...prev,
          chargerbuyeremail: email
        }));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCopyIdentity = () => {
    navigator.clipboard.writeText(formData.chargeridentity);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(API_CONFIG.LOGOUT_API, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CPO-App-ID': CPO_APP_ID,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      navigate('/signin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const emailFromToken = userEmail || getUserEmailFromToken();
      if (!emailFromToken) {
        setMessage("Error: Could not retrieve user email from authentication token.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      const payload = {
        ...formData,
        chargerbuyeremail: emailFromToken
      };

      console.log("Submitting payload:", payload);

      const response = await fetchWithTokenRefresh(API_CONFIG.CHARGERS_API, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Create charger response:', data);

      if (response.ok) {
        setMessage(data.message || "Charger created successfully!");
        setMessageType("success");
        setCreatedCharger(data.charger || data.data || data);
        setShowSuccessPopup(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            Chargerserialnum: "",
            ChargerName: "",
            Chargerhost: "",
            host_phone: "",
            Segment: "",
            Subsegment: "",
            Total_Capacity: "",
            Chargertype: "",
            parking: "",
            number_of_connectors: "",
            Connector_type: "",
            connector_total_capacity: "",
            charger_use_type: "",
            twenty_four_seven_open_status: "",
            charger_image: "",
            chargerbuyeremail: emailFromToken,
            chargeridentity: "",
            protocol: "",
          });
          setCurrentStep(1);
          setImageFile(null);
        }, 3000);
      } else {
        setMessage(data.message || data.error?.message || 'Failed to create charger');
        setMessageType("error");
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage(error.message || "Server error. Try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Settings Dropdown Menu - Black color
  const SettingsMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-80 shadow-2xl border border-gray-800 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 flex-shrink-0">
            {userData?.user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white truncate">
              {userData?.user?.full_name || 'User'}
            </h4>
            <p className="text-sm text-gray-400 truncate">
              {userData?.user?.email || 'user@transev.com'}
            </p>
            {userData?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded-full text-xs text-gray-300 border border-gray-600">
                {userData.role}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/profile');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <User size={16} className="text-gray-500" /> 
          <span>Profile</span>
        </button>
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            navigate('/organization');
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Building size={16} className="text-gray-500" /> 
          <span>Organization</span>
        </button>
        <div className="border-t border-gray-700 my-1"></div>
        <button 
          onClick={() => {
            setShowSettingsMenu(false);
            handleLogout();
          }}
          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-900/30 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition"
        >
          <LogOut size={16} className="text-red-500" /> 
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Add Dropdown Menu - Black color, only Add Hub
  const AddMenu = () => (
    <div className="absolute top-full right-0 mt-2 bg-black rounded-2xl w-64 shadow-2xl border border-gray-800 z-50">
      <div className="p-3">
        <button 
          onClick={() => {
            setShowAddMenu(false);
            navigate("/add-hub");
          }}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 text-sm font-medium text-gray-300 hover:text-white flex items-center gap-3 transition"
        >
          <Plus size={18} className="text-gray-400" /> Add Hub
        </button>
      </div>
    </div>
  );

  // Success Popup
  const SuccessPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Charger Created!</h3>
          <p className="text-gray-600 mb-4">
            The charger has been successfully created and added to the system.
          </p>
          {createdCharger && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {createdCharger.name || formData.ChargerName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID:</span> {createdCharger.charger_id || createdCharger.id || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> 
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate('/manage-chargers');
              }}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              View Chargers
            </button>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                setFormData({
                  Chargerserialnum: "",
                  ChargerName: "",
                  Chargerhost: "",
                  host_phone: "",
                  Segment: "",
                  Subsegment: "",
                  Total_Capacity: "",
                  Chargertype: "",
                  parking: "",
                  number_of_connectors: "",
                  Connector_type: "",
                  connector_total_capacity: "",
                  charger_use_type: "",
                  twenty_four_seven_open_status: "",
                  charger_image: "",
                  chargerbuyeremail: userEmail,
                  chargeridentity: "",
                  protocol: "",
                });
                setCurrentStep(1);
                setImageFile(null);
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Options for select fields
 const chargerTypeOptions = [
  { value: "DC", label: "DC Charger" },
  { value: "AC", label: "AC Charger" }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b-2 border-gray-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Add Charger</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <Settings size={20} className="text-gray-600" />
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showSettingsMenu && <SettingsMenu />}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={18} />
                </button>
                {showAddMenu && <AddMenu />}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Zap size={24} className="text-green-600" />
                  Register New Charger Unit
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure and add a new EV charger to the system
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>
                    Step <strong className="text-gray-900">{currentStep}</strong> of{" "}
                    <strong className="text-gray-900">{steps.length}</strong>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span>{steps[currentStep - 1]}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <Shield size={16} className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-green-700 font-medium">OCPP Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex flex-wrap gap-3">
            {steps.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                  ${
                    currentStep === i + 1
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : currentStep > i + 1
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
              >
                {currentStep > i + 1 ? (
                  <CheckCircle size={16} className="text-blue-600" />
                ) : (
                  <span className="font-bold">{i + 1}</span>
                )}
                {step}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6"
          >
            {/* STEP 1 - Basic Info */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Charger Serial Number" 
                  name="Chargerserialnum" 
                  value={formData.Chargerserialnum}
                  onChange={handleChange}
                  placeholder="CHG-0001"
                  required
                />
                <Input 
                  label="Charger Name" 
                  name="ChargerName" 
                  value={formData.ChargerName}
                  onChange={handleChange}
                  placeholder="Main Station Charger"
                  required
                />
                <Input 
                  label="Charger Host" 
                  name="Chargerhost" 
                  value={formData.Chargerhost}
                  onChange={handleChange}
                  placeholder="Company Name"
                  required
                />
                <Input 
                  label="Host Phone Number" 
                  name="host_phone" 
                  type="tel"
                  value={formData.host_phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
                <SelectField 
                  label="Segment" 
                  name="Segment"
                  value={formData.Segment}
                  onChange={handleChange}
                  options={segmentOptions}
                />
                <SelectField 
                  label="Subsegment" 
                  name="Subsegment"
                  value={formData.Subsegment}
                  onChange={handleChange}
                  options={subsegmentOptions}
                />
              </div>
            )}

            {/* STEP 2 - Hardware */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Total Capacity (kW)" 
                  name="Total_Capacity" 
                  type="number" 
                  value={formData.Total_Capacity}
                  onChange={handleChange}
                  placeholder="150"
                  required
                />
                <SelectField 
                  label="Charger Type" 
                  name="Chargertype"
                  value={formData.Chargertype}
                  onChange={handleChange}
                  options={chargerTypeOptions}
                  required
                />
                <SelectField 
                  label="Parking Type" 
                  name="parking"
                  value={formData.parking}
                  onChange={handleChange}
                  options={parkingOptions}
                  required
                />
                <Input 
                  label="Number of Connectors" 
                  name="number_of_connectors" 
                  type="number" 
                  value={formData.number_of_connectors}
                  onChange={handleChange}
                  placeholder="2"
                  required
                />
                <SelectField 
                  label="Connector Type" 
                  name="Connector_type"
                  value={formData.Connector_type}
                  onChange={handleChange}
                  options={connectorTypeOptions}
                  required
                />
                <Input 
                  label="Connector Capacity (kW)" 
                  name="connector_total_capacity" 
                  type="number" 
                  value={formData.connector_total_capacity}
                  onChange={handleChange}
                  placeholder="75"
                  required
                />
              </div>
            )}

            {/* STEP 3 - Usage & Owner */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField 
                    label="Charger Use Type" 
                    name="charger_use_type"
                    value={formData.charger_use_type}
                    onChange={handleChange}
                    options={chargerUseTypeOptions}
                    required
                  />
                  <SelectField 
                    label="24/7 Open Status" 
                    name="twenty_four_seven_open_status"
                    value={formData.twenty_four_seven_open_status}
                    onChange={handleChange}
                    options={openStatusOptions}
                    required
                  />
                  
                  <SelectField 
                    label="Protocol" 
                    name="protocol"
                    value={formData.protocol}
                    onChange={handleChange}
                    options={protocolOptions}
                    required
                  />
                  
                  <div>
                    <label className="text-base text-gray-700 font-semibold">Charger Buyer Email</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="email"
                        value={formData.chargerbuyeremail}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-5 py-3.5 cursor-not-allowed opacity-80 text-base"
                      />
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap border border-green-200">
                        From Token
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-filled from your authentication token
                    </p>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Image size={20} className="text-blue-600" />
                    Charger Image
                  </h3>
                  <FileUpload 
                    label="Charger Image" 
                    name="charger_image"
                    value={formData.charger_image}
                    onChange={handleChange}
                  />
                </div>

                {/* Charger Identity - Removed location dependency */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-base text-gray-700 font-semibold">Charger Identity</label>
                  </div>
                  <div className="flex gap-3">
                    <Input 
                      label=""
                      name="chargeridentity"
                      value={formData.chargeridentity}
                      onChange={handleChange}
                      placeholder="Enter charger identity"
                    />
                    <button
                      type="button"
                      onClick={handleCopyIdentity}
                      className="mt-1 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 text-white transition text-base font-medium"
                    >
                      <Copy size={18} />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a unique identifier for this charger
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition font-medium text-base"
                  disabled={isLoading}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-medium text-base shadow-lg shadow-blue-500/25"
                  disabled={isLoading}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-2 justify-center min-w-[180px] font-medium text-base shadow-lg shadow-blue-500/25"
                  disabled={isLoading || !userEmail}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Submit Charger
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* User email status */}
            {!userEmail && currentStep === 3 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  ⚠️ Unable to retrieve your email from authentication token. Please ensure you are logged in properly.
                </p>
              </div>
            )}
          </form>

          {/* Response Message */}
          {message && (
            <div className={`border rounded-xl p-4 ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <p className="flex items-center gap-2">
                {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default AddChargerForm;