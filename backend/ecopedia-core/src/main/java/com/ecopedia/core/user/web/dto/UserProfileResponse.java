package com.ecopedia.core.user.web.dto;

import com.ecopedia.core.user.domain.Role;
import com.ecopedia.core.user.domain.User;
import java.time.Instant;

public record UserProfileResponse(
        Long id, String email, String fullName, Role role, boolean active, Instant createdAt) {
    public static UserProfileResponse fromDomain(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt());
    }
}
