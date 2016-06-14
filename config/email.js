module.exports.email = {
  transporter: {
  host: 'smtp.office365.com', // Godaddy SMTP server
  port: 587,
  secure: false,
  auth: {
    user: "carlos@sennit.com.br",
    pass: "HZui1199"
  }
},
  from: 'carlos@sennit.com.br',
  testMode: false
}