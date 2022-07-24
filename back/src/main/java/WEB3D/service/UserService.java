package WEB3D.service;

import WEB3D.common.Utils;
import WEB3D.controller.request.RegisterRequest;
import WEB3D.domain.User;
import WEB3D.repository.AuthorityRepository;
import WEB3D.repository.UserRepository;
import WEB3D.security.jwt.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@Transactional
public class UserService {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    private final AuthorityRepository authorityRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserService(AuthorityRepository authorityRepository, UserRepository userRepository) {
        this.authorityRepository = authorityRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> register(RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        String username = request.getUsername();
        String password = request.getPassword();
        String modelName = request.getModelName();

        if (userRepository.findByUsername(username) != null) {
            response.put("message","Username " + username + " has been registered");
        } else if (Utils.registerIsInvalid(request)) {
            response.put("message","Invalid format of your register info");
        } else{

            User user = new User(username, (new BCryptPasswordEncoder()).encode(password),
                    new HashSet<>(Collections.singletonList(authorityRepository.findByAuthority("User"))),
                    modelName);
            userRepository.save(user);
            response.put("message", "Register success!");
            response.put("id", user.getId());
        }
        return response;
    }
}
