package booking_platform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public authentication
                        .requestMatchers(
                                "/api/auth/**",
                                "/error"
                        ).permitAll()

                        // Vendor-only endpoints
                        .requestMatchers(
                                "/api/vendors/**"
                        ).hasAuthority("ROLE_VENDOR")

                        // Vendor's own services endpoint
                        // MUST come before /api/services/**
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/services/vendor"
                        ).hasAuthority("ROLE_VENDOR")

                        // Public service browsing
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/services/**"
                        ).permitAll()

                        // Vendor service management
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/services"
                        ).hasAuthority("ROLE_VENDOR")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/services/**"
                        ).hasAuthority("ROLE_VENDOR")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/services/**"
                        ).hasAuthority("ROLE_VENDOR")

                        // Admin
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // Vendor bookings
                        .requestMatchers(
                                "/api/bookings/vendor/**"
                        ).hasAuthority("ROLE_VENDOR")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/bookings/*/status"
                        ).hasAuthority("ROLE_VENDOR")

                        // Customer bookings
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/bookings/**"
                        ).hasAuthority("ROLE_CUSTOMER")

                        .requestMatchers(
                                "/api/bookings/customer/**"
                        ).hasAuthority("ROLE_CUSTOMER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/bookings/*/cancel"
                        ).hasAuthority("ROLE_CUSTOMER")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}