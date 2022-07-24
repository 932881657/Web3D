package WEB3D.controller.request;

import WEB3D.domain.Instruction;

import java.util.List;

public class SolveRequest {
    private String stage;
    private String number;
    private String token;
    private List<Instruction> instructions;

    public SolveRequest() {
    }

    public SolveRequest(String stage, String number, String token, List<Instruction> instructions) {
        this.stage = stage;
        this.number = number;
        this.token = token;
        this.instructions = instructions;
    }

    public String getStage() {
        return stage;
    }

    public String getNumber() {
        return number;
    }

    public String getToken() {
        return token;
    }

    public List<Instruction> getInstructions() {
        return instructions;
    }
}
