package WEB3D.service;

import WEB3D.controller.request.LoginRequest;
import WEB3D.exception.BadAuthRequestException;
import WEB3D.exception.PasswordIncorrectException;
import WEB3D.repository.*;
import WEB3D.security.jwt.JwtTokenUtil;
import WEB3D.domain.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import WEB3D.common.Utils;

import java.util.*;


@Service
public class AuthService {
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    public AuthService(UserRepository userRepository, AuthorityRepository authorityRepository) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
    }

    public Map<String, Object> login(LoginRequest loginRequest) throws UsernameNotFoundException, PasswordIncorrectException, BadAuthRequestException {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        String type = loginRequest.getType();
        Map<String, Object> result = new HashMap<>();
        Authentication authentication = null;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
        } catch (Exception e) {
            if (userRepository.findByUsername(loginRequest.getUsername()) == null) {
                result.put("message", "Username "+ loginRequest.getUsername()+ " not found!");
                return result;
            } else if (!(new BCryptPasswordEncoder()).matches(password, userRepository.findByUsername(username).getPassword())) {
                result.put("message", "Password for "+ loginRequest.getUsername()+ " is not correct!");
                return result;
            }
        }
        User user = (User) authentication.getPrincipal();
        if ("user".equals(type) && user.getAuthoritiesString().contains("User")) {
            result.put("role", "User");
        } else if ("admin".equals(type)) {
            result.put("role", "Admin");
        } else {
            //check for invalid type & no-auth situation
            throw new BadAuthRequestException();
        }
        result.put("message", "success");
        result.put("modelName", user.getModelName());
        result.put("token", jwtTokenUtil.generateToken(user));
        return result;
    }

    public Map<String, Object> changePassword(String password, String rePassword, String token) {
        Map<String, Object> result = new HashMap<>();
        User user = userRepository.findByUsername(jwtTokenUtil.getUsernameFromToken(token));
        if (user == null) {
            result.put("message", "You are using a bad credential");
            return result;
        }
        if (!(new BCryptPasswordEncoder()).matches(password, user.getPassword())) {
            result.put("message", "Your first input must match your original password");
            return result;
        }
        //separate two cases user or admin
        boolean flag1 = false, flag2 = false;
        if (user.getAuthoritiesString().contains("User")) {
            flag1 = Utils.isUserInvalid(user.getUsername(), rePassword);
        } else if (user.getAuthoritiesString().contains("Admin")) {
            flag2 = Utils.isAdminInvalid(user.getUsername(), rePassword);
        }
        if (flag1) {
            result.put("message", "Illegal password, more than digits, letters - or _");
        } else if (flag2) {
            result.put("message", "Illegal password, more than digits, letters - or _");
        } else {
            user.setPassword((new BCryptPasswordEncoder()).encode(rePassword));
            userRepository.save(user);
            result.put("message", "success");
        }
        return result;
    }

    public Map<String, Object> center(String token) {
        Map<String, Object> result = new HashMap<>();
        User user = userRepository.findByUsername(jwtTokenUtil.getUsernameFromToken(token));
        if (user == null) {
            result.put("message", "You are using a bad credential");
            return result;
        }
        result.put("message", "success");
        result.put("username", user.getUsername());
        result.put("modelName", user.getModelName());
        result.put("solutions", user.getSolutions());
        return result;
    }

}
