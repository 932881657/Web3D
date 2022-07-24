package WEB3D.common;

import WEB3D.controller.request.RegisterRequest;
import WEB3D.domain.Instruction;
import WEB3D.domain.Problem;
import WEB3D.domain.Status;
import WEB3D.exception.ExecInstructionException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Utils {
    public static boolean registerIsInvalid(RegisterRequest registerRequest){
        return isUserInvalid(registerRequest.getUsername(), registerRequest.getPassword());
    }

    public static boolean isUserInvalid(String username, String password) {
        return username == null || password == null || !password.matches("^[\\w-]{6,}$");
    }

    public static boolean isAdminInvalid(String username, String password) {
        return username == null || password == null || !password.matches("^[\\w-]{6,}$");
    }

    public static boolean isStrNotNull(String str){
        return (str != null) && (!"".equals(str));
    }

    public static boolean isNumeric(String str){
        for (int i = str.length() - 1; i >= 0 ; i--){
            if (!Character.isDigit(str.charAt(i))){
                return false;
            }
        }
        return true;
    }

    public static List<Status> execInstructions(Problem problem, List<Instruction> instructions) throws ExecInstructionException {
        List<Status> statusList = new ArrayList<>();
        List<Instruction> available_inst = problem.getInstructions();
        for (Instruction instruction : instructions) {
            boolean found = false;
            for (Instruction inst : available_inst) {
                if (inst.getName().equals(instruction.getName())) {
                    found = true;
                    break;
                }
            }
            if (!found)
                throw new ExecInstructionException("forbidden instruction used!");
        }

        List<String> input = new ArrayList<>(Arrays.asList(problem.getInput().split(";")));
        List<String> output = new ArrayList<>();
        List<String> answer = new ArrayList<>(Arrays.asList(problem.getOutput().split(";")));

        String[] temp = problem.getMemory().split(";");
        int length = Integer.parseInt(temp[0]);
        String[] memory;
        if (length == 0) {
            memory = null;
        }
        else {
            memory = new String[length];
            for (int i = 0; i < memory.length; i++) {
                if (temp[i + 1].equals("-"))
                    memory[i] = null;
                else
                    memory[i] = temp[i + 1];
            }
        }

        int steps = 0;
        int inst_index = 0;
        boolean exception = false;
        boolean finish = false;
        String hand = null;
        String finishStatusMsg = "";
        while (!finish && !exception && inst_index < instructions.size()) {
            Instruction instruction = instructions.get(inst_index);
            switch (instruction.getName()) {
                case "inbox" : {
                    if (input.size() == 0) {
                        exception = true;
                        finishStatusMsg = "input list is empty!";
                    }
                    else {
                        hand = input.get(0);
                        input.remove(0);
                    }
                    break;
                }
                case "outbox" : {
                    if (hand == null) {
                        exception = true;
                        finishStatusMsg = "nothing for output! you must inbox or copyfrom first";
                    }
                    else {
                        output.add(hand);
                        hand = null;
                        int size = output.size();
                        if (!output.get(size - 1).equals(answer.get(size - 1))) {
                            exception = true;
                            finishStatusMsg = "output error!";
                        }
                        else if (size == answer.size())
                            finish = true;
                    }
                    break;
                }
                case "copyfrom" : {
                    int referTo = instruction.getReferTo();
                    if (memory == null) {
                        exception = true;
                        finishStatusMsg = "memory not available!";
                    }
                    else if (referTo < 0 || referTo >= memory.length) {
                        exception = true;
                        finishStatusMsg = "memory index out of bound!";
                    }
                    else
                        hand = memory[referTo];
                    break;
                }
                case "copyto" : {
                    int referTo = instruction.getReferTo();
                    if (hand == null) {
                        exception = true;
                        finishStatusMsg = "nothing in hand";
                    }
                    else if (memory == null) {
                        exception = true;
                        finishStatusMsg = "memory not available!";
                    }
                    else if (referTo < 0 || referTo >= memory.length) {
                        exception = true;
                        finishStatusMsg = "memory index out of bound!";
                    }
                    else
                        memory[referTo] = hand;
                    break;
                }
                case "add" : {
                    int referTo = instruction.getReferTo();
                    if (hand == null) {
                        exception = true;
                        finishStatusMsg = "nothing in hand";
                    }
                    else if (memory == null) {
                        exception = true;
                        finishStatusMsg = "memory not available!";
                    }
                    else if (referTo < 0 || referTo >= memory.length) {
                        exception = true;
                        finishStatusMsg = "memory index out of bound!";
                    }
                    else
                        hand = Integer.parseInt(hand) + Integer.parseInt(memory[referTo]) + "";
                    break;
                }
                case "sub" : {
                    int referTo = instruction.getReferTo();
                    if (hand == null) {
                        exception = true;
                        finishStatusMsg = "nothing in hand";
                    }
                    else if (memory == null) {
                        exception = true;
                        finishStatusMsg = "memory not available!";
                    }
                    else if (referTo < 0 || referTo >= memory.length) {
                        exception = true;
                        finishStatusMsg = "memory index out of bound!";
                    }
                    else
                        hand = Integer.parseInt(hand) - Integer.parseInt(memory[referTo]) + "";
                    break;
                }
                case "bump+" : {
                    int referTo = instruction.getReferTo();
                    if (memory == null) {
                        exception = true;
                        finishStatusMsg = "memory not available!";
                    }
                    else if (referTo < 0 || referTo >= memory.length) {
                        exception = true;
                        finishStatusMsg = "memory index out of bound!";
                    }
                    else {
                        int bump = Integer.parseInt(memory[referTo]) + 1;
                        hand = bump + "";
                        memory[referTo] = hand;
                    }
                    break;
                }
                case "bump-" : {
                    int referTo = instruction.getReferTo();
                    if (memory == null) {
                        exception = true;
                        finishStatusMsg = "memory not available!";
                    }
                    else if (referTo < 0 || referTo >= memory.length) {
                        exception = true;
                        finishStatusMsg = "memory index out of bound!";
                    }
                    else {
                        int bump = Integer.parseInt(memory[referTo]) - 1;
                        hand = bump + "";
                        memory[referTo] = hand;
                    }
                    break;
                }
                case "jump" : {
                    int jumpTo = instruction.getJumpTo();
                    if (jumpTo < 0 || jumpTo > instructions.size()) {
                        exception = true;
                        finishStatusMsg = "jumpTo index out of bound!";
                    }
                    else
                        inst_index = jumpTo - 1;
                    break;
                }
                case "jump_zero" : {
                    int jumpTo = instruction.getJumpTo();
                    if (jumpTo < 0 || jumpTo > instructions.size()) {
                        exception = true;
                        finishStatusMsg = "jumpTo index out of bound!";
                    }
                    else if (hand == null) {
                        exception = true;
                        finishStatusMsg = "nothing in hand !";
                    }
                    else {
                        if (isNumeric(hand) && Integer.parseInt(hand) == 0) {
                            inst_index = jumpTo - 1;
                        }
                    }
                    break;
                }
                case "jump_neg" : {
                    int jumpTo = instruction.getJumpTo();
                    if (jumpTo < 0 || jumpTo > instructions.size()) {
                        exception = true;
                        finishStatusMsg = "jumpTo index out of bound!";
                    }
                    else if (hand == null) {
                        exception = true;
                        finishStatusMsg = "nothing in hand !";
                    }
                    else {
                        if (Integer.parseInt(hand) < 0) {
                            inst_index = jumpTo - 1;
                        }
                    }
                    break;
                }
            }
            if (exception)
                statusList.add(new Status(finishStatusMsg, steps));
            else
                statusList.add(new Status(input, output, memory, hand));
            inst_index++;
            steps++;
            if (steps > 1000) {
                throw new ExecInstructionException("execution steps out of bound!");
            }
        }
        if (finish)
            statusList.add(new Status("success!", steps));
        else if (!exception) {
            statusList.add(new Status("wrong output!", steps));
        }
        return statusList;
    }

}


