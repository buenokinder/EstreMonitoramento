module.exports.email = {
  transporter: {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
      user: "michel.oliveira@sennit.com.br",
    pass: "Meusucesso1"
  }
},
  from: 'michel.oliveira@sennit.com.br',
  testMode: false
}