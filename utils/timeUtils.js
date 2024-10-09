// utils/timeUtils.js

const calculateRemainingTime = (approvalDate, reservationDuration) => {
    const currentDate = new Date();
    const endDate = new Date(approvalDate);
    endDate.setDate(endDate.getDate() + reservationDuration);
    
    const remainingTime = endDate - currentDate; // milliseconds
    return remainingTime > 0 ? remainingTime : 0; // return 0 if time has lapsed
  };
  
  module.exports = {
    calculateRemainingTime,
  };
  