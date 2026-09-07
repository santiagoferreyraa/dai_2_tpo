package com.ecopedia.core.user.web.dto;

import com.ecopedia.core.user.domain.AuthToken;
import com.ecopedia.core.user.domain.Role;

public record AuthResponse(String token, Long userId, String email, Role role, long expiresInSeconds) {
    public static AuthResponse fromDomain(AuthToken authToken) {
        return new AuthResponse(
                authToken.token(),
                authToken.userId(),
                authToken.email(),
                authToken.role(),
                authToken.expiresInSeconds());
    }
}
