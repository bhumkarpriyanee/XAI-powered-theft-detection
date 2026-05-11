export const generatePDFReport = (alerts) => {
  const printWindow = window.open('', '_blank');
  const date = new Date().toLocaleString();
  
  const html = `
    <html>
      <head>
        <title>Theft Detection Report - ${date}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #2c3e50; }
          .header p { margin: 5px 0 0 0; color: #7f8c8d; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; }
          td { padding: 12px; border-bottom: 1px solid #dee2e6; }
          .risk-high { color: #e74c3c; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 0.8rem; color: #95a5a6; text-align: center; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Electricity Theft Investigation Report</h1>
          <p>Generated on: ${date}</p>
          <p>Total Flagged Cases: ${alerts.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Zone</th>
              <th>Risk Probability</th>
              <th>Last Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${alerts.map(a => `
              <tr>
                <td>#${a.customer_id}</td>
                <td>${a.zone}</td>
                <td class="risk-high">${(a.probability * 100).toFixed(1)}%</td>
                <td>${a.last_timestamp || 'N/A'}</td>
                <td>Suspected Theft</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Confidential - XAI Powered Theft Detection System</p>
          <p>For official field use only.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            // window.close(); // Optional: close after printing
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
