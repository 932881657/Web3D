package WEB3D.controller.request;

public class UserDefineRequest {
    private String token;

    private int stage;

    private String title;
    private String description;
    private String input;
    private String output;

    private String instructions;

    //initial status of memory
    private String memory;

    private String worldInfo;

    public String getToken() {
        return token;
    }

    public int getStage() {
        return stage;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getInput() {
        return input;
    }

    public String getWorldInfo(){
        return worldInfo;
    }

    public String getOutput() {
        return output;
    }

    public String getMemory() {
        return memory;
    }

    public String getInstructions() {
        return instructions;
    }

    public UserDefineRequest(String token, int stage, String title, String description, String input, String output, String instructions, String memory, String worldInfo) {
        this.token = token;
        this.stage = stage;
        this.title = title;
        this.description = description;
        this.input = input;
        this.output = output;
        this.instructions = instructions;
        this.memory = memory;
        this.worldInfo = worldInfo;
    }
}
