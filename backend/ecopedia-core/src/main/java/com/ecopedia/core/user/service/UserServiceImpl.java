package com.ecopedia.core.user.service;

import com.ecopedia.core.security.JwtTokenProvider;
import com.ecopedia.core.user.domain.*;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public UserServiceImpl(
            UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public User register(RegistrationData data) {
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado: " + data.email());
        }

        User user = new User();
        user.setEmail(data.email());
        user.setPasswordHash(passwordEncoder.encode(data.rawPassword()));
        user.setFullName(data.fullName());
        user.setRole(data.role() != null ? data.role() : Role.CONDUCTOR);
        user.setActive(true);

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthToken authenticate(Credentials credentials) {
        User user = userRepository
                .findByEmail(credentials.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("El usuario está dado de baja");
        }

        if (!passwordEncoder.matches(credentials.rawPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        long expiresInSeconds = tokenProvider.getExpirationMs() / 1000;

        return new AuthToken(token, user.getId(), user.getEmail(), user.getRole(), expiresInSeconds);
    }

    @Override
    @Transactional(readOnly = true)
    public User getProfile(Long userId) {
        return userRepository
                .findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public User getProfileByEmail(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + email));
    }

    @Override
    public User updateProfile(Long userId, ProfileData data) {
        User user = getProfile(userId);
        if (data.fullName() != null && !data.fullName().isBlank()) {
            user.setFullName(data.fullName());
        }
        return userRepository.save(user);
    }

    @Override
    public void deactivateUser(Long userId) {
        User user = getProfile(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> listUsers(Role roleFilter) {
        if (roleFilter != null) {
            return userRepository.findByRole(roleFilter);
        }
        return userRepository.findAll();
    }
}
