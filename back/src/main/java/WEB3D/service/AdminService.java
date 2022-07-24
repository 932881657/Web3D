package WEB3D.service;

import WEB3D.domain.Problem;
import WEB3D.domain.Solution;
import WEB3D.domain.User;
import WEB3D.repository.ProblemRepository;
import WEB3D.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;

    @Autowired
    public AdminService(UserRepository userRepository, ProblemRepository problemRepository) {
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
    }

    public Map<String, Object> adminCenter() {
        Map<String, Object> result = new HashMap<>();
        List<User> users = userRepository.findAll();
        Map<String, List<Solution>> solutionMap = new HashMap<>();

        int userCount = users.size() - 1;
        users.remove(userRepository.findByUsername("admin"));

        for (Problem problem : problemRepository.findAll()) {
            solutionMap.put(problem.getStage() + "-" + problem.getNumber(), problem.getSolutions());
        }

        result.put("userCount", userCount);
        result.put("solutionMap", solutionMap);
        return result;
    }
}
