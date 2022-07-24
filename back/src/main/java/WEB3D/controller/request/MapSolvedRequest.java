package WEB3D.controller.request;

public class MapSolvedRequest {
    private String token;
    private int stage;

    public MapSolvedRequest() {
    }

    public MapSolvedRequest(String token, int stage) {
        this.token = token;
        this.stage = stage;
    }

    public int getStage() {
        return stage;
    }

    public String getToken() {
        return token;
    }
}
