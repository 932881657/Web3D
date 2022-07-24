package WEB3D.domain;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Solution {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private int stage;
    private int number;

    private int steps;

    private int numInst;

    @ManyToMany(targetEntity = Instruction.class, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Instruction> instructions = new ArrayList<>();

    public Solution() {
    }

    public Solution(int stage, int number, int steps, int numInst, List<Instruction> instructions) {
        this.stage = stage;
        this.number = number;
        this.steps = steps;
        this.numInst = numInst;
        this.instructions = instructions;
    }

    public int getStage() {
        return stage;
    }

    public int getNumber() {
        return number;
    }
    public int getSteps() {
        return steps;
    }

    public int getNumInst() {
        return numInst;
    }

    public List<Instruction> getInstructions() {
        return new ArrayList<>(instructions);
    }
}
