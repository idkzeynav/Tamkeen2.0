import React from 'react';
import { AiOutlineDownload } from "react-icons/ai";

const ExportOrdersButton = ({ orders }) => {
  const exportToCSV = () => {
    // Theme colors for styling
    const themeColors = {
      primary: '#c8a4a5', // Soft pink
      secondary: '#e6d8d8', // Light baby brown
      tertiary: '#f5f0f0', // Off-white
      light: '#faf7f7', // Very light background
      white: '#ffffff', // Pure white
      dark: '#5a4336', // Dark brown for text
      warning: '#f59e0b', // Warning color for flag
      danger: '#ef4444', // Error color for hate speech alerts
    };
    
    // For Excel, we can use HTML formatting that will be recognized
    const csvHeader = ['Order ID', 'Items Qty', 'Total', 'Status'];
    
    // Convert orders data to CSV rows
    const csvRows = orders.map(order => [
      order._id,
      order.cart.length,
      order.totalPrice,
      order.status
    ]);
    
    // Create Excel HTML format
    let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    excelContent += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Shop Orders</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    excelContent += '<body>';
    excelContent += '<table>';
    
    // Add styled header row
    excelContent += '<tr>';
    csvHeader.forEach(header => {
      excelContent += `<th style="background-color: ${themeColors.primary}; color: ${themeColors.dark}; font-weight: bold; padding: 8px; text-align: center; border: 1px solid ${themeColors.secondary};">${header}</th>`;
    });
    excelContent += '</tr>';
    
    // Add data rows with alternating colors
    csvRows.forEach((row, index) => {
      const backgroundColor = index % 2 === 0 ? themeColors.tertiary : themeColors.white;
      excelContent += '<tr>';
      row.forEach((cell, cellIndex) => {
        // Apply special styling to Status column
        if (cellIndex === 3) { // Status column
          const statusColor = cell === 'Delivered' ? '#4ade80' : themeColors.danger;
          excelContent += `<td style="padding: 8px; border: 1px solid ${themeColors.secondary}; background-color: ${backgroundColor}; color: ${statusColor}; font-weight: bold;">${cell}</td>`;
        } else {
          excelContent += `<td style="padding: 8px; border: 1px solid ${themeColors.secondary}; background-color: ${backgroundColor}; color: ${themeColors.dark};">${cell}</td>`;
        }
      });
      excelContent += '</tr>';
    });
    
    excelContent += '</table>';
    excelContent += '</body>';
    excelContent += '</html>';
    
    // Create a blob with the Excel HTML data
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    
    // Create a download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shop-orders-${new Date().toLocaleDateString()}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={exportToCSV}
      className="bg-[#c8a4a5] hover:bg-[#b89293] text-[#5a4336] font-semibold p-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center gap-2 border border-[#5a4336]"
    >
      <AiOutlineDownload size={18} />
      <span>Export Excel</span>
    </button>
  );
};

export default ExportOrdersButton;