package com.sampleproject.demoproject.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(
            nullable = false,
            unique = true
    )
    private String username;


    @Column(
            nullable = false,
            unique = true
    )
    private String email;


    @Column(nullable = false)
    private String password;


    @Column(name = "otp")
    private String otp;


    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;


    @Column(name = "otp_verified")
    private boolean otpVerified;


    public User() {
    }


    public Long getId() {
        return id;
    }


    public String getUsername() {
        return username;
    }


    public void setUsername(
            String username
    ) {
        this.username = username;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(
            String password
    ) {
        this.password = password;
    }


    public String getOtp() {
        return otp;
    }


    public void setOtp(
            String otp
    ) {
        this.otp = otp;
    }


    public LocalDateTime getOtpExpiry() {
        return otpExpiry;
    }


    public void setOtpExpiry(
            LocalDateTime otpExpiry
    ) {
        this.otpExpiry = otpExpiry;
    }


    public boolean isOtpVerified() {
        return otpVerified;
    }


    public void setOtpVerified(
            boolean otpVerified
    ) {
        this.otpVerified = otpVerified;
    }
}