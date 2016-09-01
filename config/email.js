module.exports.email = {
  transporter: {
  host: 'smtp.office365.com', // Godaddy SMTP server
  port: 587,
  secure: false,
  auth: {
      user: "michel.oliveira@sennit.com.br",
    pass: "senha do email"
  }
},
  from: 'michel.oliveira@sennit.com.br',
  testMode: false
}