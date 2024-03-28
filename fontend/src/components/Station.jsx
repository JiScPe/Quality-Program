import React, { useState } from 'react';
import Navbar from './Navbar';
import "./Station.css";

const Station = () => {
  // State to store the barcode value
  const [barcode, setBarcode] = useState('');

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can perform any action with the barcode value, such as searching
    console.log('Barcode submitted:', barcode);
    // Clearing the input field after submission
    setBarcode('');
  };

  return (
    <div>
      <Navbar />
      <div className="form-container1">
        <form onSubmit={handleSubmit}>
          <label><b>Barcode:</b></label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode value"
            className="form-input1"
          />
          <button type="submit" className="btn btn-primary1">Search</button>
        </form>
      </div>
    </div>
  );
};

export default Station;
