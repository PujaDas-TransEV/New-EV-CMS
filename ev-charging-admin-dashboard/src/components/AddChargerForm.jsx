import React, { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

const steps = [
  "Basic Info",
  "Hardware",
  "Location",
  "Usage & Owner",
];

const AddChargerForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [ocppurl, setOcppurl] = useState("");

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
    chargerbuyer: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://be.cms.ocpp.transev.site/admin/createchargerunit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiauthkey:
              "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setOcppurl(data.ocppurl || "");
      } else {
        setMessage(data.message || "Failed to create charger");
      }
    } catch {
      setMessage("Server error. Try again.");
    }
  };

  const Input = ({ label, name }) => (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <input
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="mt-1 w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-200">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* HEADER */}
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
      Required fields only • OCPP enabled
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
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Charger Serial Number" name="Chargerserialnum" />
              <Input label="Charger Name" name="ChargerName" />
              <Input label="Charger Host" name="Chargerhost" />
              <Input label="Segment" name="Segment" />
              <Input label="Subsegment" name="Subsegment" />
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Total Capacity (kW)" name="Total_Capacity" />
              <Input label="Charger Type" name="Chargertype" />
              <Input label="Parking Type" name="parking" />
              <Input
                label="Number of Connectors"
                name="number_of_connectors"
              />
              <Input label="Connector Type" name="Connector_type" />
              <Input
                label="Connector Capacity"
                name="connector_total_capacity"
              />
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Latitude" name="lattitude" />
              <Input label="Longitude" name="longitute" />
              <Input label="Full Address" name="full_address" />
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Charger Use Type" name="charger_use_type" />
              <Input
                label="24/7 Open Status"
                name="twenty_four_seven_open_status"
              />
              <Input label="Charger Image URL" name="charger_image" />
              <Input label="Charger Buyer" name="chargerbuyer" />
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
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
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700"
              >
                Submit Charger
              </button>
            )}
          </div>
        </form>

        {/* RESPONSE */}
        {message && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className={ocppurl ? "text-green-400" : "text-red-400"}>
              {message}
            </p>
            {ocppurl && (
              <p className="text-blue-400 mt-1">
                OCPP URL: <span className="font-mono">{ocppurl}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddChargerForm;
