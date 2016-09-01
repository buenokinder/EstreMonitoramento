module.exports.email = {
  transporter: {
  host: 'smtp.office365.com', // Godaddy SMTP server
  port: 587,
  secure: false,
  auth: {
      user: "michel.oliveira@sennit.com.br",
<<<<<<< HEAD
    pass: "Meusucesso1"
=======
    pass: "senha do email"
>>>>>>> 2016_08_29__2016_09_02
  }
},
  from: 'michel.oliveira@sennit.com.br',
  testMode: false
}