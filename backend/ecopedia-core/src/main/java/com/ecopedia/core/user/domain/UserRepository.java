package com.ecopedia.core.user.domain;

import java.util.List;
import java.util.Optional;

/**
 * Puerto DAO de persistencia de {@link User} en la capa de negocio.
 */
public interface UserRepository {
    User save(User user);

    Optional<User> findById(Long userId);

    Optional<User> findByEmail(String email);

    List<User> findAll();

    List<User> findByRole(Role role);
}
