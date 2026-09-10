package booking_platform.service;

import booking_platform.entity.Role;
import booking_platform.entity.User;
import booking_platform.repository.UserRepository;
import booking_platform.security.JwtUtil;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public User register(
            String email,
            String password,
            String fullName,
            Role role) {

        // Email validation
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        email = email.trim().toLowerCase();

        if (!email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            throw new RuntimeException(
                    "Please enter a valid email address");
        }

        // Password validation
        if (password == null || password.isEmpty()) {
            throw new RuntimeException(
                    "Password is required");
        }

        if (password.length() < 6) {
            throw new RuntimeException(
                    "Password must contain at least 6 characters");
        }

        // Name validation
        if (fullName == null ||
                fullName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Full name is required");
        }

        fullName = fullName.trim();

        // Role validation
        if (role == null) {
            throw new RuntimeException(
                    "Role is required");
        }

        if (role == Role.ROLE_ADMIN) {
            throw new RuntimeException(
                    "Admin registration is not allowed");
        }

        // Duplicate email
        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new RuntimeException(
                    "Email already registered");
        }

        User user = new User();

        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(password)
        );
        user.setFullName(fullName);
        user.setRole(role);

        return userRepository.save(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public String login(
            String email,
            String password) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required");
        }

        if (password == null ||
                password.isEmpty()) {

            throw new RuntimeException(
                    "Password is required");
        }

        email = email.trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        password
                )
        );

        return jwtUtil.generateToken(email);
    }
}