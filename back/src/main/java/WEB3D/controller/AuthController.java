package WEB3D.controller;

import WEB3D.controller.request.CenterRequest;
import WEB3D.controller.request.ChangePasswordRequest;
import WEB3D.controller.request.LoginRequest;
import WEB3D.controller.request.RegisterRequest;
import WEB3D.security.jwt.JwtTokenUtil;
import WEB3D.service.AdminService;
import WEB3D.service.AuthService;
import WEB3D.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final AdminService adminService;
    private final JwtTokenUtil jwtTokenUtil;

    Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    public AuthController(AuthService authService, UserService userService, JwtTokenUtil jwtTokenUtil, AdminService adminService) {
        this.authService = authService;
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.adminService = adminService;
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        logger.debug("RegistrationForm: " + request.toString());
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.debug("LoginForm: " + request.toString());
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changePassword(request.getPassword(), request.getRePassword(), request.getToken()));
    }

    @PostMapping("/center")
    public ResponseEntity<?> center(@RequestBody CenterRequest request) {
        return ResponseEntity.ok(authService.center(request.getToken()));
    }

    @GetMapping("/admin/center")
    public ResponseEntity<?> adminCenter() {
        return ResponseEntity.ok(adminService.adminCenter());
    }

}
