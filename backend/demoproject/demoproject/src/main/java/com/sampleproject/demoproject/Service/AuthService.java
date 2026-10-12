package com.sampleproject.demoproject.Service;

import com.sampleproject.demoproject.Model.OTPRequest;
import com.sampleproject.demoproject.Model.User;
import com.sampleproject.demoproject.Repository.UserRepository;
import com.sampleproject.demoproject.Model.LoginRequest;
import com.sampleproject.demoproject.Model.SignupRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {


    @Autowired
    private UserRepository userRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private EmailService emailService;


    @Autowired
    private JWTService jwtService;


    public Map<String, Object> signup(
            SignupRequest request
    ) {

        if (
                userRepository.existsByEmail(
                        request.getEmail()
                )
        ) {

            throw new RuntimeException(
                    "Email already registered."
            );
        }


        if (
                userRepository.existsByUsername(
                        request.getUsername()
                )
        ) {

            throw new RuntimeException(
                    "Username already exists."
            );
        }


        User user =
                new User();


        user.setUsername(
                request.getUsername()
        );


        user.setEmail(
                request.getEmail()
        );


        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        user.setOtpVerified(false);


        userRepository.save(user);


        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "message",
                "Account created successfully."
        );


        return response;
    }

    public Map<String, Object> login(
            LoginRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Invalid email or password."
                                        )
                        );


        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )
        ) {

            throw new RuntimeException(
                    "Invalid email or password."
            );
        }


        String otp =
                generateOtp();


        user.setOtp(otp);


        user.setOtpExpiry(
                LocalDateTime.now()
                        .plusMinutes(5)
        );


        user.setOtpVerified(false);


        userRepository.save(user);


        // Send OTP

        emailService.sendOtp(
                user.getEmail(),
                user.getUsername(),
                otp
        );


        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "message",
                "OTP sent successfully."
        );


        return response;
    }


    public Map<String, Object> verifyOtp(
            OTPRequest request
    ) {

        User user =
                userRepository
                        .findByEmail(
                                request.getEmail()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found."
                                        )
                        );


        // Check OTP

        if (
                user.getOtp() == null ||
                        !user.getOtp()
                                .equals(
                                        request.getOtp()
                                )
        ) {

            throw new RuntimeException(
                    "Invalid OTP."
            );
        }


        // Check expiry

        if (
                user.getOtpExpiry() == null ||
                        user.getOtpExpiry()
                                .isBefore(
                                        LocalDateTime.now()
                                )
        ) {

            throw new RuntimeException(
                    "OTP has expired."
            );
        }


        // OTP verified

        user.setOtpVerified(true);

        user.setOtp(null);

        user.setOtpExpiry(null);


        userRepository.save(user);


        // Generate JWT

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );


        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "accessToken",
                token
        );


        Map<String, Object> userData =
                new HashMap<>();


        userData.put(
                "id",
                user.getId()
        );


        userData.put(
                "username",
                user.getUsername()
        );


        userData.put(
                "email",
                user.getEmail()
        );


        response.put(
                "user",
                userData
        );


        return response;
    }


    public Map<String, Object> resendOtp(
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found."
                                        )
                        );


        String otp =
                generateOtp();


        user.setOtp(otp);


        user.setOtpExpiry(
                LocalDateTime.now()
                        .plusMinutes(5)
        );


        userRepository.save(user);


        emailService.sendOtp(
                email,
                user.getUsername(),
                otp
        );


        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "message",
                "OTP resent successfully."
        );


        return response;
    }


    private String generateOtp() {

        Random random =
                new Random();


        return String.format(
                "%06d",
                random.nextInt(1000000)
        );
    }
}