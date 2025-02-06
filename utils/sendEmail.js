const nodemailer = require("nodemailer");

module.exports = async (userEmail, subject, htmlTemplate) => {

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ADDRESS, //sender
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const mailOptions = {
            from: `"Blog App" <${process.env.EMAIL_ADDRESS}>`, // sender
            to: userEmail, // receiver
            subject: subject,
            html: htmlTemplate
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(info.response);


    } catch (error) {
        console.log(error);
        throw new Error("Failed to send email");
    }
}