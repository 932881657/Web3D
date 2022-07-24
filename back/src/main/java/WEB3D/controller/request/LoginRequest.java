package WEB3D.controller.request;

public class LoginRequest {
    private String username;
    private String password;
    private String type;

    public LoginRequest(String username, String password, String type) {
        this.username = username;
        this.password = password;
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public String getType() {
        return type;
    }

}
