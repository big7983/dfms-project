export const verificationEmailTemplate = (
  recieverName: string,
  message: string
) => {
  return ` 
    <html lang="en">
  <head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    }

    .email-header {
      display: flex;
      justify-content: start;
      align-items: center;
      margin-inline: 4px;
      background-color: #FF6500;
      padding: 10px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      margin: 0;
      font-size: 24px;
      padding-left: 50px;
    }

    .email-body {
      padding: 20px;
      text-align: left;
    }

    .email-body h2 {
      color: #FF6500;
      font-size: 20px;
    }

    .email-body p {
      line-height: 1.6;
      margin: 10px 0;
    }

    .email-footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e4e4e4;
    }

    .subject {
      margin-left: 1rem;
    }

    .green-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #FF6500;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }

    .green-button:hover {
      background-color: #005760;
    }

    .contract-box {
      padding: 15px;
      border: 1px solid #d3d3d3;
      /* กรอบสีเทาอ่อน */
      background-color: #f9f9f9;
      /* พื้นหลังสีเทาอ่อน */
      border-radius: 5px;
      margin: 10px;
    }
  </style>
</head>

  <body>
    <div class="email-container">
      <div class="email-header">
        <!-- ใส่รูป Logo -->
        <img
          src="logo ssi Group (Red).jpg"
          alt="Company Logo"
          style="width: 32px; height: auto"
        />
        <p class="subject">Contracts Online Application</p>
      </div>
      <div class="email-body">
        <h2>เรียน คุณ ${recieverName}</h2>
        <p>
          ${message}
        </p>

        
      </div>
      <div>
        <p>
          Auto Email Sent By Contract Online Application. Please don't reply
        </p>
        <p>Thank You.</p>
      </div>
      <div class="email-footer">
        <p>Copyright © Sahaviriya Steel Industries PLC</p>
      </div>
    </div>
  </body>
</html>
    `;
};
