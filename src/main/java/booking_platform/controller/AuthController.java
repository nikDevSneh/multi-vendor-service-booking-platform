package booking_platform.controller;

import booking_platform.entity.Role;
import booking_platform.entity.User;
import booking_platform.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String fullName,
            @RequestParam Role role) {

        User user = authService.register(
                email,
                password,
                fullName,
                role
        );

        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestParam String email,
            @RequestParam String password) {

        String token = authService.login(
                email,
                password
        );

        return ResponseEntity.ok(token);
    }
}