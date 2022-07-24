package WEB3D.controller.request;

public class RegisterRequest {
    private String username;
    private String password;
    private String modelName;

    public RegisterRequest(String username, String password, String modelName) {
        this.username = username;
        this.password = password;
        this.modelName = modelName;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getModelName(){return modelName;}

}

