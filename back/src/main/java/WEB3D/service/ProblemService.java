package WEB3D.service;

import WEB3D.controller.request.MapSolvedRequest;
import WEB3D.controller.request.ProblemRequest;
import WEB3D.controller.request.SolveRequest;
import WEB3D.controller.request.UserDefineRequest;
import WEB3D.domain.*;
import WEB3D.common.Utils;
import WEB3D.repository.InstructionRepository;
import WEB3D.repository.ProblemRepository;
import WEB3D.repository.SolutionRepository;
import WEB3D.repository.UserRepository;
import WEB3D.security.jwt.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;

import java.util.*;

import static WEB3D.common.Utils.isNumeric;

@Service
public class ProblemService {
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SolutionRepository solutionRepository;
    private final InstructionRepository instructionRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    public ProblemService(UserRepository userRepository, ProblemRepository problemRepository, SolutionRepository solutionRepository, InstructionRepository instructionRepository) {
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.solutionRepository = solutionRepository;
        this.instructionRepository = instructionRepository;
    }

    public Map<String, Object> problem(ProblemRequest problemRequest) {
        Map<String, Object> result = new HashMap<>();
        if (!isNumeric(problemRequest.getStage()) || !isNumeric(problemRequest.getNumber())) {
            result.put("message", "bad argument");
            return result;
        }
        int stage = Integer.parseInt(problemRequest.getStage());
        int number = Integer.parseInt(problemRequest.getNumber());
        Problem problem = problemRepository.findByStageAndNumber(stage, number);
        if (problem != null) {
            result.put("problem", problem);
            result.put("message", "success");
        } else {
            result.put("message", "problem not found");
        }
        return result;
    }

    public Map<String, Object> mapProblems(MapSolvedRequest mapSolvedRequest) {
        Map<String, Object> result = new HashMap<>();
        int stage = mapSolvedRequest.getStage();
        List<Problem> problems = problemRepository.findAllByStage(stage);
        result.put("problems", problems);
        String token = mapSolvedRequest.getToken();
        User user = userRepository.findByUsername(jwtTokenUtil.getUsernameFromToken(token));
        if (user == null) {
            result.put("message", "User does not exist");
            return result;
        }
        // get system-defined problem count
        result.put("mapSolved", getMapSolved(user, stage));
        Set<String> instructions = new HashSet<>();
        for (Problem problem : problems) {
            for (Instruction instruction : problem.getInstructions()) {
                instructions.add(instruction.getName());
            }
        }
        result.put("instructions", instructions);
        return result;
    }

    public Map<String, Object> userDefine(UserDefineRequest request) {
        Map<String, Object> result = new HashMap<>();
        String token = request.getToken();
        int stage = request.getStage();

        String instructions = request.getInstructions();
        String[] instructionNames = instructions.split(";");
        List<Instruction> instructionList = new ArrayList<>();
        for (String instName : instructionNames) {
            instructionList.add(new Instruction(instName));
        }

        // sanity check
        User user = userRepository.findByUsername(jwtTokenUtil.getUsernameFromToken(token));
        if (user == null) {
            result.put("message", "User does not exist");
            return result;
        }
        if (stage < 1 || stage > 3) {
            result.put("message", "Invalid stage number");
            return result;
        }

        List<Problem> problems = problemRepository.findAllByStage(stage);
        problems.sort(Comparator.comparingInt(Problem::getNumber));
        int currNumber = problems.get(problems.size() - 1).getNumber() + 1;
        Problem newProblem = new Problem(stage,
                currNumber,
                request.getTitle(),
                request.getDescription(),
                instructionList,
                request.getInput(), request.getOutput(), request.getMemory(), request.getWorldInfo());
        newProblem.setIfUserDefined(true);
        problemRepository.save(newProblem);
        result.put("message", "success");
        result.put("name", newProblem.getStage() + "-" + newProblem.getNumber());
        return result;
    }

    public Map<String, Object> solve(SolveRequest solveRequest) {
        Map<String, Object> result = new HashMap<>();
        if (!isNumeric(solveRequest.getStage()) || !isNumeric(solveRequest.getNumber())) {
            result.put("message", "bad argument");
            return result;
        }
        int stage = Integer.parseInt(solveRequest.getStage());
        int number = Integer.parseInt(solveRequest.getNumber());
        Problem problem = problemRepository.findByStageAndNumber(stage, number);
        List<Instruction> instructions = solveRequest.getInstructions();
        User user = userRepository.findByUsername(jwtTokenUtil.getUsernameFromToken(solveRequest.getToken()));
        List<Status> statusList = new ArrayList<>();
        try {
            statusList = Utils.execInstructions(problem, instructions);
        } catch (Exception e) {
            result.put("message", e.getMessage());
            return result;
        }
        Status finalStatus = statusList.get(statusList.size() - 1);
        if (finalStatus.getFinishStatusMsg().equals("success!")) {
            int steps = finalStatus.getSteps();
            Solution solution = new Solution(stage, number, steps, instructions.size(), instructions);
            user.addSolution(solution);
            userRepository.save(user);
            problem.addSolution(solution);
            problemRepository.save(problem);
            result.put("message", "success");
            result.put("mapSolved", getMapSolved(user, stage));
        } else
            result.put("message", finalStatus.getFinishStatusMsg());

        result.put("statusList", statusList);
        return result;
    }

    private boolean getMapSolved(User user, int stage) {
        // get system-defined problem count
        int systemProblemCount = 0;
        List<Problem> systemProblems = problemRepository.findAllByStage(stage);
        for (Problem problem : systemProblems) {
            if (!problem.isIfUserDefined()) {
                systemProblemCount++;
            }
        }

        List<Solution> solutions = user.getSolutions();
        Set<Integer> solved = new HashSet<>();
        for (Solution solution : solutions) {
            if (stage == solution.getStage()) {
                solved.add(solution.getNumber());
            }
        }
        return solved.size() == systemProblemCount;
    }
}
