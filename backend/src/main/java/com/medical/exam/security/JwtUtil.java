
package com.medical.exam.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(String userId, String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return JWT.create()
                .withSubject(userId)
                .withClaim("username", username)
                .withClaim("role", role)
                .withIssuedAt(now)
                .withExpiresAt(expiryDate)
                .sign(Algorithm.HMAC256(secret));
    }

    public String getUserIdFromToken(String token) {
        DecodedJWT jwt = JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token);
        return jwt.getSubject();
    }

    public String getUsernameFromToken(String token) {
        DecodedJWT jwt = JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token);
        return jwt.getClaim("username").asString();
    }

    public String getRoleFromToken(String token) {
        DecodedJWT jwt = JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token);
        return jwt.getClaim("role").asString();
    }

    public boolean validateToken(String token) {
        try {
            JWT.require(Algorithm.HMAC256(secret))
                    .build()
                    .verify(token);
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }
}
