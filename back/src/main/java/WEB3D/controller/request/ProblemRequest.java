package WEB3D.controller.request;

public class ProblemRequest {
    private String stage;
    private String number;

    public ProblemRequest() {}
    public ProblemRequest(String stage, String number){
        this.stage = stage;
        this.number = number;
    }

    public String getStage() {
        return stage;
    }

    public String getNumber() {
        return number;
    }
}
