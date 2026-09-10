package booking_platform.controller;

import booking_platform.entity.Role;
import booking_platform.entity.User;
import booking_platform.repository.UserRepository;
import booking_platform.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(
            AuthService authService,
            UserRepository userRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String fullName,
            @RequestParam Role role) {

        try {

            if (role == Role.ROLE_ADMIN) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Admin registration is not allowed"
                        ));
            }

            User user = authService.register(
                    email,
                    password,
                    fullName,
                    role
            );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole().name());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String email,
            @RequestParam String password) {

        try {

            String token =
                    authService.login(
                            email,
                            password
                    );

            return ResponseEntity.ok(token);

        } catch (Exception e) {

            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                            "message",
                            "Invalid email or password"
                    ));
        }
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                            "message",
                            "Not authenticated"
                    ));
        }

        String email =
                authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + email
                        ));

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // TEST
    // =========================================================

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        return ResponseEntity.ok(
                "Auth controller is working!"
        );
    }
}