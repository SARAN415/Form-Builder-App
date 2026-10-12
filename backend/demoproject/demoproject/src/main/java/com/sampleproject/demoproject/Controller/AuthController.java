package com.sampleproject.demoproject.Controller;

import com.sampleproject.demoproject.Model.User;
import com.sampleproject.demoproject.Repository.UserRepository;
import com.sampleproject.demoproject.Service.AuthService;
import com.sampleproject.demoproject.Model.LoginRequest;
import com.sampleproject.demoproject.Model.OTPRequest;
import com.sampleproject.demoproject.Model.SignupRequest;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(
        origins = "http://localhost:3000"
)
public class AuthController {


    @Autowired
    private AuthService authService;


    @Autowired
    private UserRepository userRepository;


    // =================================================
    // SIGNUP
    // =================================================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody SignupRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    authService.signup(request)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =================================================
    // LOGIN
    // =================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            System.out.println(
                    "LOGIN REQUEST EMAIL = "
                            + request.getEmail()
            );

            Map<String, Object> result =
                    authService.login(request);

            System.out.println(
                    "LOGIN SUCCESS = "
                            + result
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Authentication failed"
                            )
                    );
        }
    }


    // =================================================
    // VERIFY OTP
    // =================================================

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody OTPRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    authService.verifyOtp(
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =================================================
    // RESEND OTP
    // =================================================

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestBody Map<String, String> request
    ) {

        try {

            String email =
                    request.get("email");


            return ResponseEntity.ok(
                    authService.resendOtp(email)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =================================================
    // CURRENT USER
    // =================================================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                        !authentication.isAuthenticated()
        ) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Unauthorized"
                            )
                    );
        }


        User user =
                (User) authentication
                        .getPrincipal();


        return ResponseEntity.ok(
                Map.of(
                        "id",
                        user.getId(),

                        "username",
                        user.getUsername(),

                        "email",
                        user.getEmail()
                )
        );
    }
}