package com.sampleproject.demoproject.Security;

import com.sampleproject.demoproject.Model.User;
import com.sampleproject.demoproject.Repository.UserRepository;
import com.sampleproject.demoproject.Service.JWTService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JWTAuthFilter
        extends OncePerRequestFilter {

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserRepository userRepository;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        // Allow CORS preflight
        if ("OPTIONS".equalsIgnoreCase(
                request.getMethod()
        )) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        String authHeader =
                request.getHeader("Authorization");


        System.out.println(
                "AUTH HEADER = "
                        + authHeader
        );


        if (
                authHeader == null ||
                        !authHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        String token =
                authHeader.substring(7);


        try {

            String email =
                    jwtService.extractEmail(
                            token
                    );


            System.out.println(
                    "JWT EMAIL = "
                            + email
            );


            if (
                    email != null &&
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication()
                                    == null
            ) {


                User user =
                        userRepository
                                .findByEmail(email)
                                .orElse(null);


                if (user == null) {

                    System.out.println(
                            "USER NOT FOUND"
                    );

                    filterChain.doFilter(
                            request,
                            response
                    );

                    return;
                }


                if (
                        jwtService.isTokenValid(
                                token
                        )
                ) {


                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    Collections.singletonList(
                                            new SimpleGrantedAuthority(
                                                    "ROLE_USER"
                                            )
                                    )
                            );


                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(
                                            request
                                    )
                    );


                    // VERY IMPORTANT
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );


                    System.out.println(
                            "JWT AUTHENTICATION SUCCESS"
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT VALIDATION FAILED = "
                            + e.getMessage()
            );
        }


        filterChain.doFilter(
                request,
                response
        );
    }
}