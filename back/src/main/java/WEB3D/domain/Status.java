package WEB3D.domain;

import java.util.ArrayList;
import java.util.List;

public class Status {
    private List<String> input;
    private List<String> output;
    private String[] memory;
    private String hand;

    private String finishStatusMsg;

    private int steps;

    public Status(List<String> input, List<String> output, String[] memory, String hand) {
        //deep copy
        this.input = new ArrayList<>(input);
        this.output = new ArrayList<>(output);
        if (memory != null) {
            this.memory = new String[memory.length];
            System.arraycopy(memory, 0, this.memory, 0, memory.length);
        }
        this.hand = hand;
    }

    public Status(String finishStatusMsg, int steps) {
        this.finishStatusMsg = finishStatusMsg;
        this.steps = steps;
    }

    public List<String> getInput() {
        return input;
    }

    public List<String> getOutput() {
        return output;
    }

    public String[] getMemory() {
        return memory;
    }

    public String getHand() {
        return hand;
    }

    public String getFinishStatusMsg() {
        return finishStatusMsg;
    }

    public int getSteps() {
        return steps;
    }
}
