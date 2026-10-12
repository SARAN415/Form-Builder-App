package com.sampleproject.demoproject.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {


    @Autowired
    private JavaMailSender mailSender;


    public void sendOtp(
            String email,
            String username,
            String otp
    ) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            message.setRecipients(
                    MimeMessage.RecipientType.TO,
                    email
            );

            message.setSubject(
                    "FormBuilder Account Verification – One-Time Password"
            );

            message.setContent(
                    "<html>"
                            + "<body>"
                            + "<p>Dear "+username+",</p>"

                            + "<p>"
                            + "We received a request to verify your account on FormBuilder."
                            + "</p>"

                            + "<p>"
                            + "Your One-Time Password (OTP) is:"
                            + "</p>"

                            + "<p>"
                            + "<b>" + otp + "</b>"
                            + "</p>"

                            + "<p>"
                            + "This OTP is valid for 1 minute. "
                            + "Please do not share this OTP with anyone."
                            + "</p>"

                            + "<p>"
                            + "If you did not request this verification, "
                            + "please ignore this email."
                            + "</p>"

                            + "<p>"
                            + "Regards,<br>"
                            + "FormBuilder Team"
                            + "</p>"

                            + "</body>"
                            + "</html>",
                    "text/html"
            );

            mailSender.send(message);

        } catch (MessagingException e) {

            throw new RuntimeException(
                    "Failed to send OTP email",
                    e
            );
        }
    }
}