export const PRODUCT_CONFIG = {
  OXYGEN: {
    productName: "Oxygen Gas",
    processMethod: "pressure-based",
    inputLabel: "Initial Cylinder Pressure (bar)",
    outputLabel: "Final Filled Pressure (bar)",
    outputUnit: "bar",
    calculateNet: (input, output) => Number(output) - Number(input),
    validateProcess: (net) => {
      if (net > 200) return { indicator: "Over", status: "Rejected", color: "red" };
      if (net < 190) return { indicator: "Under", status: "Success", color: "amber" };
      return { indicator: "OK", status: "Success", color: "green" };
    },
    sealOptions: ["Standard Valve Seal", "Medical Grade Seal", "Industrial Seal"],
    tagLabelType: "HAZMAT O2 - Class 2.2",
    expiryIntervalDays: 365
  },
  LUBRICANT: {
    productName: "Engine Oil 5W-30",
    processMethod: "weight-based",
    inputLabel: "Empty Drum Weight (kg)",
    outputLabel: "Filled Drum Weight (kg)",
    outputUnit: "kg",
    calculateNet: (input, output) => Number(output) - Number(input),
    validateProcess: (net) => {
      if (net > 50.5) return { indicator: "Over", status: "Rejected", color: "red" };
      if (net < 49.5) return { indicator: "Under", status: "Success", color: "amber" };
      return { indicator: "OK", status: "Success", color: "green" };
    },
    sealOptions: ["Tamper Evident Cap", "Foil Seal Core", "Plastic Plug"],
    tagLabelType: "LUBE 5W30 BATCH",
    expiryIntervalDays: 1095
  }
};

export const INITIAL_BATCHES = [
  {
    batchNumber: "BATCH-2024-OXY-001",
    productType: "OXYGEN",
    status: "Pending", // Pending -> Complete
    items: [
      { serialNumber: "OXY-CYL-0101", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
      { serialNumber: "OXY-CYL-0102", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
      { serialNumber: "OXY-CYL-0103", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
      { serialNumber: "OXY-CYL-0104", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
      { serialNumber: "OXY-CYL-0105", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
    ]
  },
  {
    batchNumber: "BATCH-2024-LUB-099",
    productType: "LUBRICANT",
    status: "Pending",
    items: [
      { serialNumber: "DRUM-LUB-5001", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
      { serialNumber: "DRUM-LUB-5002", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
      { serialNumber: "DRUM-LUB-5003", inputValue: 0, outputValue: 0, netOutput: 0, indicator: "", itemStatus: "Issued" },
    ]
  }
];
