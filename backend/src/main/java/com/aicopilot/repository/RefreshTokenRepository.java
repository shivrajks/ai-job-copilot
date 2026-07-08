package com.aicopilot.repository;

import com.aicopilot.entity.RefreshToken;
import com.aicopilot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.revoked = false")
    void revokeAllByUser(User user);

    @Query("SELECT COUNT(r) FROM RefreshToken r WHERE r.user = :user AND r.revoked = false AND r.expiryDate > CURRENT_TIMESTAMP")
    int countActiveByUser(User user);
}
