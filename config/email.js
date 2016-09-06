module.exports.email = {
  transporter: {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
      user: "admin@sennit.com.br",
    pass: "HZui7700"
  }
},
  from: 'admin@sennit.com.br',
  testMode: false
}