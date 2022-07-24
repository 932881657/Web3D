package WEB3D.service;

import WEB3D.WEB3DApplication;
import WEB3D.controller.request.LoginRequest;
import WEB3D.controller.request.SolveRequest;
import WEB3D.domain.Instruction;
import org.junit.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = WEB3DApplication.class)
public class ServiceTest {
    @Autowired
    private ProblemService problemService;

    @Autowired
    private AuthService authService;

    @Test
    public void solveTest_1_1() {
        Map<String, Object> m = authService.login(new LoginRequest("admin", "password", "admin"));
        String token = m.get("token").toString();
        List<Instruction> instructions = new ArrayList<>();
        instructions.add(new Instruction("outbox"));
        SolveRequest solveRequest = new SolveRequest("1", "1", token, instructions);
        Map<String, Object> map = problemService.solve(solveRequest);
    }

    @Test
    public void solveTest_1_2() {
        Map<String, Object> m = authService.login(new LoginRequest("admin", "password", "admin"));
        String token = m.get("token").toString();
        List<Instruction> instructions = new ArrayList<>();
        instructions.add(new Instruction("inbox"));
        instructions.add(new Instruction("outbox"));
        instructions.add(new Instruction("jump", 0));
        SolveRequest solveRequest = new SolveRequest("1", "2", token, instructions);
        Map<String, Object> map = problemService.solve(solveRequest);
    }

    @Test
    public void solveTest_1_3(){
        Map<String, Object> m = authService.login(new LoginRequest("admin", "password", "admin"));
        String token = m.get("token").toString();
        List<Instruction> instructions = new ArrayList<>();
        instructions.add(new Instruction("copyfrom", 4));
        instructions.add(new Instruction("outbox"));
        instructions.add(new Instruction("copyfrom", 0));
        instructions.add(new Instruction("outbox"));
        instructions.add(new Instruction("copyfrom", 3));
        instructions.add(new Instruction("outbox"));
        SolveRequest solveRequest = new SolveRequest("1", "3", token, instructions);
        Map<String, Object> map = problemService.solve(solveRequest);
    }

    @Test
    public void solveTest_1_5(){
        Map<String, Object> m = authService.login(new LoginRequest("admin", "password", "admin"));
        String token = m.get("token").toString();
        List<Instruction> instructions = new ArrayList<>();
        instructions.add(new Instruction("inbox"));
        instructions.add(new Instruction("jump_zero", 0));
        instructions.add(new Instruction("outbox"));
        instructions.add(new Instruction("jump", 0));
        SolveRequest solveRequest = new SolveRequest("1", "5", token, instructions);
        Map<String, Object> map = problemService.solve(solveRequest);
    }

    @Test
    public void solveTest_2_1(){
        Map<String, Object> m = authService.login(new LoginRequest("admin", "password", "admin"));
        String token = m.get("token").toString();
        List<Instruction> instructions = new ArrayList<>();
        instructions.add(new Instruction("inbox"));
        instructions.add(new Instruction("copyto", 0));
        instructions.add(new Instruction("inbox"));
        instructions.add(new Instruction("add", 0));
        instructions.add(new Instruction("outbox"));
        instructions.add(new Instruction("jump", 0));
        SolveRequest solveRequest = new SolveRequest("2", "1", token, instructions);
        Map<String, Object> map = problemService.solve(solveRequest);
    }
}
