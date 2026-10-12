package com.sampleproject.demoproject.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JWTService {


    @Value("${jwt.secret}")
    private String secret;


    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(secret);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(
            String email
    ) {

        Date now =
                new Date();


        Date expiry =
                new Date(
                        now.getTime()
                                + expiration
                );


        return Jwts.builder()

                .setSubject(email)

                .setIssuedAt(now)

                .setExpiration(expiry)

                .signWith(
                        SignatureAlgorithm.HS256,
                        secret
                )

                .compact();
    }


    public String extractEmail(
            String token
    ) {

        return getClaims(token)
                .getSubject();
    }


    public boolean isTokenValid(
            String token
    ) {

        try {

            Claims claims =
                    getClaims(token);


            return !claims
                    .getExpiration()
                    .before(
                            new Date()
                    );

        } catch (Exception e) {

            return false;
        }
    }




    private Claims getClaims(
            String token
    ) {

        return Jwts.parser()

                .verifyWith(
                        getSigningKey()
                )

                .build()

                .parseSignedClaims(
                        token
                )

                .getPayload();
    }
}