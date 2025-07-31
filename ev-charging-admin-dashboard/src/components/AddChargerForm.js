import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';

const AddChargerForm = () => {
  const [formData, setFormData] = useState({
    Chargerserialnum: '',
    ChargerName: '',
    Chargerhost: '',
    Segment: '',
    Subsegment: '',
    Total_Capacity: '',
    Chargertype: '',
    parking: '',
    number_of_connectors: '',
    Connector_type: '',
    connector_total_capacity: '',
    lattitude: '',
    longitute: '',
    full_address: '',
    charger_use_type: '',
    twenty_four_seven_open_status: '',
    charger_image: '',
    chargerbuyer: '', 
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState('');
  const [ocppurl, setOcppurl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://be.cms.ocpp.transev.site/admin/createchargerunit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiauthkey': `aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru`, 
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setOcppurl(data.ocppurl || ''); 
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error creating charger unit.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar/>
      
      <main className="flex-1 p-6 bg-gray-800 text-gray-200">
        <h2 className="text-2xl font-bold mb-4">Add Charger Unit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Chargerserialnum">
                  Charger Serial Number:
                </label>
                <input
                  id="Chargerserialnum"
                  name="Chargerserialnum"
                  type="text"
                  value={formData.Chargerserialnum}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="ChargerName">
                  Charger Name:
                </label>
                <input
                  id="ChargerName"
                  name="ChargerName"
                  type="text"
                  value={formData.ChargerName}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Chargerhost">
                  Charger Host:
                </label>
                <input
                  id="Chargerhost"
                  name="Chargerhost"
                  type="text"
                  value={formData.Chargerhost}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Segment">
                  Segment:
                </label>
                <input
                  id="Segment"
                  name="Segment"
                  type="text"
                  value={formData.Segment}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Subsegment">
                  Subsegment:
                </label>
                <input
                  id="Subsegment"
                  name="Subsegment"
                  type="text"
                  value={formData.Subsegment}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </>
          )}
          {currentStep === 2 && (
            <>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Total_Capacity">
                  Total Capacity:
                </label>
                <input
                  id="Total_Capacity"
                  name="Total_Capacity"
                  type="text"
                  value={formData.Total_Capacity}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Chargertype">
                  Charger Type:
                </label>
                <input
                  id="Chargertype"
                  name="Chargertype"
                  type="text"
                  value={formData.Chargertype}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="parking">
                  Parking:
                </label>
                <input
                  id="parking"
                  name="parking"
                  type="text"
                  value={formData.parking}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="number_of_connectors">
                  Number of Connectors:
                </label>
                <input
                  id="number_of_connectors"
                  name="number_of_connectors"
                  type="text"
                  value={formData.number_of_connectors}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="Connector_type">
                  Connector Type:
                </label>
                <input
                  id="Connector_type"
                  name="Connector_type"
                  type="text"
                  value={formData.Connector_type}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="connector_total_capacity">
                  Connector Total Capacity:
                </label>
                <input
                  id="connector_total_capacity"
                  name="connector_total_capacity"
                  type="text"
                  value={formData.connector_total_capacity}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 mr-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </>
          )}
          {currentStep === 3 && (
            <>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="lattitude">
                  Latitude:
                </label>
                <input
                  id="lattitude"
                  name="lattitude"
                  type="text"
                  value={formData.lattitude}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="longitute">
                  Longitude:
                </label>
                <input
                  id="longitute"
                  name="longitute"
                  type="text"
                  value={formData.longitute}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="full_address">
                  Full Address:
                </label>
                <input
                  id="full_address"
                  name="full_address"
                  type="text"
                  value={formData.full_address}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 mr-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </>
          )}
          {currentStep === 4 && (
            <>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="charger_use_type">
                  Charger Use Type:
                </label>
                <input
                  id="charger_use_type"
                  name="charger_use_type"
                  type="text"
                  value={formData.charger_use_type}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="twenty_four_seven_open_status">
                  24/7 Open Status:
                </label>
                <input
                  id="twenty_four_seven_open_status"
                  name="twenty_four_seven_open_status"
                  type="text"
                  value={formData.twenty_four_seven_open_status}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="charger_image">
                  Charger Image:
                </label>
                <input
                  id="charger_image"
                  name="charger_image"
                  type="text"
                  value={formData.charger_image}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-lg font-medium mb-1" htmlFor="chargerbuyer">
                  Charger Buyer:
                </label>
                <input
                  id="chargerbuyer"
                  name="chargerbuyer"
                  type="text"
                  value={formData.chargerbuyer}
                  onChange={handleChange}
                  className="p-2 rounded bg-gray-700 border border-gray-600"
                />
              </div>
              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 mr-2"
              >
                Previous
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </>
          )}
        </form>

        {message && (
          <div className="mt-4">
            <p className={`text-${ocppurl ? 'green' : 'red'}-400`}>{message}</p>
            {ocppurl && <p className="text-blue-400">OCPP URL: {ocppurl}</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default AddChargerForm;
